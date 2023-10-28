import canvas from '../canvas/index.js';
import { defaultOptions } from './default-options.mjs';
import { writeFile } from 'fs';

const { Canvas } = canvas;
const isNode = typeof window === 'undefined';

class CanvasTable {
  constructor(canvas, config) {
    this.columnOuterWidths = [];
    this.computedOuterWidths = [];
    this.horizontalTotalPadding = 0;
    this.isGenerated = false;
    this.tableHeight = 0;
    this.tableStartX = 0;
    this.tableStartY = 0;
    this.tableWidth = 0;
    this.x = 0;
    this.y = 0;
    this.canvas = canvas;
    this.canvasHeight = canvas.height;
    this.canvasWidth = canvas.width;
    this.config = config;
    this.ctx = canvas.getContext('2d');
    this.populateOptions();
    this.calculateTableDimensions();

    if (this.options.background) {
      this.ctx.fillStyle = this.options.background;
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }

    this.ctx.textBaseline = 'top';
    this.columns = config.columns;
    this.data = config.data;

    if (this.options.header && config.columns) {
      this.data = [config.columns.map((column) => column.title), ...this.data];
    }
  }

  async generateTable() {
    return new Promise((resolve, reject) => {
      const {
        options: { padding, title, subtitle }
      } = this;
      const tablePadding = this.calculatePadding(padding);

      this.y = tablePadding.top;
      this.x = tablePadding.left;

      try {
        this.generateTitle(title);
        this.generateTitle(subtitle);
        this.calculateColumnWidths();
        this.tableStartX = this.x;
        this.tableStartY = this.y;
        this.generateRows();
        this.generateFaders();
        this.drawTableBorders();
      } catch (error) {
        reject(error);
      }

      this.isGenerated = true;
      resolve();
    });
  }

  async renderToBlob() {
    this.throwErrorIfNotGenerated();

    return new Promise((resolve, reject) => {
      if (this.canvas instanceof Canvas) {
        reject(new Error(CanvasTable.NOT_AVAILABLE_ON_NODE));

        return;
      }

      this.canvas.toBlob(resolve);
    });
  }

  async renderToBuffer() {
    this.throwErrorIfNotGenerated();

    if (!(this.canvas instanceof Canvas)) {
      throw new Error(CanvasTable.NOT_AVAILABLE_ON_BROWSER);
    }

    return this.canvas.toBuffer();
  }

  async renderToFile(filePath) {
    this.throwErrorIfNotGenerated();

    const buffer = await this.renderToBuffer();

    return new Promise((resolve, reject) => {
      writeFile(filePath, buffer, (error) =>
        error ? reject(error) : resolve()
      );
    });
  }

  tableDimensions() {
    return {
      height: this.tableHeight,
      width: this.tableWidth,
      x: this.x,
      y: this.y
    };
  }

  calculateColumnTextWidths() {
    const {
      ctx,
      data,
      options: { cell, header }
    } = this;
    const columnWidths = Array(data[0].length).fill(1);

    for (const rowIndex in data) {
      const row = data[rowIndex];

      for (const cellIndex in row) {
        const [cellValue] = (row[cellIndex] || '').split('\n');
        const option = header && rowIndex === '0' ? header : cell;

        ctx.font = `${option.fontWeight} ${option.fontSize}px ${option.fontFamily}`;
        ctx.fillStyle = option.color;
        ctx.textAlign = option.textAlign;

        const metrics = ctx.measureText(cellValue);

        if (metrics.width > columnWidths[cellIndex]) {
          columnWidths[cellIndex] = metrics.width;
        }
      }
    }

    return columnWidths;
  }

  calculateColumnWidths() {
    const {
      ctx,
      options: { cell, fit },
      tableWidth
    } = this;
    const columnTextWidths = this.calculateColumnTextWidths();
    const cellPadding = this.calculatePadding(cell.padding);

    this.horizontalTotalPadding = cellPadding.left + cellPadding.right;

    const columnPaddingTotal =
      this.horizontalTotalPadding * columnTextWidths.length;
    const totalColumnWidths = columnTextWidths.reduce((a, b) => a + b, 0);
    const columnWidthTotal = totalColumnWidths + columnPaddingTotal;

    this.columnOuterWidths = columnTextWidths.map(
      (width) => width + this.horizontalTotalPadding
    );
    this.computedOuterWidths = [...this.columnOuterWidths];

    const minWidth = ctx.measureText(
      `${CanvasTable.ELLIPSIS}${CanvasTable.ELLIPSIS}`
    ).width;
    const minWidthWithPadding = minWidth + this.horizontalTotalPadding;

    if (columnWidthTotal > tableWidth) {
      this.computedOuterWidths = [];

      const fatColumnIndexes = [];
      const reservedWidth = tableWidth / this.columnOuterWidths.length;
      let totalFatWidth = 0;
      let remainingWidth = tableWidth;

      this.columnOuterWidths.forEach((columnOuterWidth, columnIndex) => {
        this.computedOuterWidths.push(columnOuterWidth);

        if (columnOuterWidth > reservedWidth) {
          fatColumnIndexes.push(columnIndex);
          totalFatWidth = totalFatWidth + columnOuterWidth;
        } else {
          remainingWidth = remainingWidth - columnOuterWidth;
        }
      });
      fatColumnIndexes.forEach((index) => {
        const columnOuterWidth = this.columnOuterWidths[index];
        const fatWidth = (columnOuterWidth / totalFatWidth) * remainingWidth;

        this.computedOuterWidths[index] =
          fatWidth < minWidthWithPadding ? minWidthWithPadding : fatWidth;
      });
    } else if (fit && columnWidthTotal < tableWidth) {
      const difference = tableWidth - columnWidthTotal;

      this.computedOuterWidths = columnTextWidths.map(
        (width) =>
          width +
          (difference * width) / totalColumnWidths +
          this.horizontalTotalPadding
      );
    }
  }

  calculateTableDimensions() {
    const {
      canvas,
      canvasHeight,
      canvasWidth,
      ctx,
      options: { devicePixelRatio, padding }
    } = this;

    canvas.width = canvasWidth * devicePixelRatio;
    canvas.height = canvasHeight * devicePixelRatio;

    if ('style' in canvas) {
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
    }

    const tablePadding = this.calculatePadding(padding);

    this.tableHeight = canvasHeight - tablePadding.top - tablePadding.bottom;
    this.tableWidth = canvasWidth - tablePadding.left - tablePadding.right;
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  calculatePadding(padding) {
    const value = !padding ? 0 : padding;

    if (typeof value === 'number') {
      return {
        bottom: value,
        left: value,
        right: value,
        top: value
      };
    }

    return value;
  }

  generateTitle(title) {
    const { ctx, tableWidth, x, y } = this;

    if (!title.text) {
      return;
    }

    ctx.font = `${title.fontWeight} ${title.fontSize}px ${title.fontFamily}`;
    ctx.fillStyle = title.color;
    ctx.textAlign = title.textAlign;

    const lineHeight = Math.round(title.fontSize * title.lineHeight);
    const titleLines = title.text.split('\n');
    const titleX = title.textAlign === 'center' ? tableWidth / 2 : 0;

    titleLines.forEach((line, index) =>
      ctx.fillText(line, x + titleX, y + index * lineHeight)
    );
    this.y += titleLines.length * lineHeight + lineHeight / 2;
  }

  generateRows() {
    const {
      canvasHeight,
      columnOuterWidths,
      columns,
      computedOuterWidths,
      ctx,
      data,
      horizontalTotalPadding,
      options: { cell, header, minCharWidth },
      tableStartX
    } = this;
    const cellPadding = this.calculatePadding(cell.padding);

    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];
      const lineHeight =
        cell.lineHeight * cell.fontSize + cellPadding.bottom + cellPadding.top;

      this.x = tableStartX;

      for (const cellIndex in columnOuterWidths) {
        const outerWidth = columnOuterWidths[cellIndex];
        const computedOuterWidth = computedOuterWidths[cellIndex];
        const columnOptions =
          columns && columns[cellIndex].options
            ? columns[cellIndex].options
            : {};
        let [cellValue] = row[cellIndex].split('\n');

        if (!rowIndex && header && header.background) {
          ctx.fillStyle = header.background;
          ctx.fillRect(this.x, this.y, computedOuterWidth, lineHeight);
        }

        const option =
          header && !rowIndex
            ? header
            : Object.assign(Object.assign({}, cell), columnOptions);

        ctx.font = `${option.fontWeight} ${option.fontSize}px ${option.fontFamily}`;

        if (typeof option.color === 'string') ctx.fillStyle = option.color;
        else if (typeof option.color === 'function')
          ctx.fillStyle = option.color(rowIndex, cellIndex);

        const textAlign =
          columnOptions && columnOptions.textAlign
            ? columnOptions.textAlign
            : option.textAlign;

        ctx.textAlign = textAlign;

        if (outerWidth > computedOuterWidth) {
          const isFat = () =>
            ctx.measureText(
              cellValue.length > minCharWidth
                ? `${cellValue}${CanvasTable.ELLIPSIS}`
                : `${cellValue}.`
            ).width >
            computedOuterWidth - horizontalTotalPadding;

          if (isFat()) {
            while (isFat()) {
              cellValue = cellValue.slice(0, -1);
            }

            cellValue =
              cellValue.length > minCharWidth
                ? `${cellValue}${CanvasTable.ELLIPSIS}`
                : `${cellValue}.`;
          }
        }

        let cellX = this.x + cellPadding.left;
        let cellY = this.y + cellPadding.top;

        if (textAlign === 'right') {
          cellX = this.x + computedOuterWidth - cellPadding.right;
        }

        if (textAlign === 'center') {
          cellX = this.x + computedOuterWidth / 2;
        }

        ctx.fillText(cellValue, cellX, cellY);
        this.x += computedOuterWidth;
        this.drawRowBorder(lineHeight);
      }

      this.y += lineHeight;
      this.drawColumnBorder(rowIndex);

      if (this.y > canvasHeight) {
        break;
      }
    }
  }

  drawColumnBorder(rowIndex) {
    const {
      ctx,
      options: { borders, header },
      tableStartX,
      x,
      y
    } = this;
    const columnBorder =
      !rowIndex && header && borders.header ? borders.header : borders.column;

    if (!columnBorder) {
      return;
    }

    ctx.beginPath();
    ctx.moveTo(tableStartX, y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = columnBorder.color;
    ctx.lineWidth = columnBorder.width;
    ctx.stroke();
  }

  drawRowBorder(lineHeight) {
    const {
      ctx,
      options: {
        borders: { row }
      }
    } = this;

    if (!row) {
      return;
    }

    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x, this.y + lineHeight);
    ctx.strokeStyle = row.color;
    ctx.lineWidth = row.width;
    ctx.stroke();
  }

  generateFaders() {
    const {
      canvasHeight,
      canvasWidth,
      ctx,
      options: { background, fader },
      x,
      y
    } = this;

    if (!fader) {
      return;
    }

    if (y > canvasHeight && fader.bottom) {
      const bottomFader = ctx.createLinearGradient(
        0,
        canvasHeight - fader.size,
        0,
        canvasHeight
      );

      bottomFader.addColorStop(0, CanvasTable.TRANSPARENT_COLOR);
      bottomFader.addColorStop(1, background);
      ctx.fillStyle = bottomFader;
      ctx.fillRect(0, canvasHeight - fader.size, canvasWidth, fader.size);
    }

    if (x > canvasWidth && fader.right) {
      const rightFader = ctx.createLinearGradient(
        canvasWidth - fader.size,
        0,
        canvasWidth,
        0
      );

      rightFader.addColorStop(0, CanvasTable.TRANSPARENT_COLOR);
      rightFader.addColorStop(1, background);
      ctx.fillStyle = rightFader;
      ctx.fillRect(canvasWidth - fader.size, 0, fader.size, canvasHeight);
    }
  }

  drawTableBorders() {
    const { table } = this.options.borders;

    if (!table) {
      return;
    }

    const { ctx, tableStartX, tableStartY, x, y } = this;

    ctx.strokeStyle = table.color;
    ctx.lineWidth = table.width;
    ctx.strokeRect(tableStartX, tableStartY, x - tableStartX, y - tableStartY);
  }

  populateOptions() {
    const { options } = this.config;

    if (!options) {
      this.options = { ...defaultOptions };

      return;
    }

    const { borders, header, cell, fader, subtitle, title } = defaultOptions;
    const defaultPadding = defaultOptions.padding;
    const padding =
      options.padding !== undefined
        ? typeof options.padding !== 'number'
          ? { ...defaultPadding, ...options.padding }
          : options.padding
        : defaultPadding;

    this.options = {
      ...defaultOptions,
      ...options,
      borders: options.borders ? { ...borders, ...options.borders } : borders,
      header: options.header ? { ...header, ...options.header } : header,
      cell: options.cell ? { ...cell, ...options.cell } : cell,
      fader: options.fader ? { ...fader, ...options.fader } : fader,
      padding: padding,
      subtitle: options.subtitle
        ? { ...subtitle, ...options.subtitle }
        : subtitle,
      title: options.title ? { ...title, ...options.title } : title
    };
  }

  throwErrorIfNotGenerated() {
    if (!this.isGenerated) {
      throw new Error(CanvasTable.NOT_GENERATED_ERROR_MESSAGE);
    }
  }
}

CanvasTable.ELLIPSIS = '…';
CanvasTable.NOT_AVAILABLE_ON_BROWSER = 'Not available on browser';
CanvasTable.NOT_AVAILABLE_ON_NODE = 'Not available on node';
CanvasTable.NOT_GENERATED_ERROR_MESSAGE =
  'CanvasTable has not been generated. Please call generateTable() first.';
CanvasTable.TRANSPARENT_COLOR = !isNode ? 'rgba(255,255,255,0)' : 'transparent';

export { CanvasTable };
