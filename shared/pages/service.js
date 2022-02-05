import { BasePage } from '../page.js';

export class ServicePage extends BasePage {
  filterCards(text) {
    for (const card of Array.from(this.cards.children)) {
      if (!text || new RegExp(text.trim(), 'ig').test(card.textContent))
        card.style.display = 'initial';
      else card.style.display = 'none';
    }
  }
}
