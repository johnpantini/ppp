export default function (i18n) {
  i18n.extend({
    $settingsWorkspacePage: {
      widgetSnapping: 'Widget snapping',
      widgetSnappingDescription:
        'The snap distance defines the minimum distance between vertical or horizontal widget edges at which snapping activates, pulling the widgets together to the margin value. The values are set in pixels. To disable snapping, set both values to 0.',
      snapDistance: 'Snap distance',
      snapMargin: 'Widget margin',
      confirmWidgetClosing: 'Confirm widget closing',
      confirmWidgetClosingDescription:
        'If enabled, a confirmation dialog will be shown when you try to close a widget.',
      widgetNotificationTimeout: 'Widget notification timeout',
      widgetNotificationTimeoutDescription:
        'This setting only applies to notifications that disappear over time. Set in milliseconds. A zero value disables notifications.',
      psinaBaseUrl: 'Psina widgets base URL',
      psinaBaseUrlDescription:
        'Allows you to specify an alternative source for loading widgets.',
      emptyWorkspaceInstallation: 'Installation in an empty workspace',
      doNotShow: 'Do not show',
      debugSettings: 'Debugging settings',
      debugSettingsDescription:
        'To enable debug mode for the entire application, use the * namespace',
      debugNamespaces: 'Debugging namespaces',
      useDebugColors: 'Use colors in messages',
      saveSettings: 'Save settings',
      valueMustBeNonNegative: 'The value must be non-negative',
      valueMustBeNotGreater: 'The value must not be greater than %{max}'
    }
  });
}
