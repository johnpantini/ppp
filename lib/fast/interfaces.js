const postfix = `-${Math.random().toString(36).substring(2, 8)}`;
const KernelServiceId = Object.freeze({
  updateQueue: `1.2${postfix}`,
  observable: `2.2${postfix}`,
  contextEvent: `3.2${postfix}`,
  elementRegistry: `4.2${postfix}`
});

export { KernelServiceId };

/**
 * Warning and error messages.
 * @internal
 */
export let Message;
(function (Message) {
  // 1000 - 1100 Kernel
  // 1101 - 1200 Observation
  Message[(Message['needsArrayObservation'] = 1101)] = 'needsArrayObservation';
  // 1201 - 1300 Templating
  Message[(Message['onlySetDOMPolicyOnce'] = 1201)] = 'onlySetDOMPolicyOnce';
  Message[(Message['bindingInnerHTMLRequiresTrustedTypes'] = 1202)] =
    'bindingInnerHTMLRequiresTrustedTypes';
  Message[(Message['twoWayBindingRequiresObservables'] = 1203)] =
    'twoWayBindingRequiresObservables';
  Message[(Message['hostBindingWithoutHost'] = 1204)] =
    'hostBindingWithoutHost';
  Message[(Message['unsupportedBindingBehavior'] = 1205)] =
    'unsupportedBindingBehavior';
  Message[(Message['directCallToHTMLTagNotAllowed'] = 1206)] =
    'directCallToHTMLTagNotAllowed';
  Message[(Message['onlySetTemplatePolicyOnce'] = 1207)] =
    'onlySetTemplatePolicyOnce';
  Message[(Message['cannotSetTemplatePolicyAfterCompilation'] = 1208)] =
    'cannotSetTemplatePolicyAfterCompilation';
  Message[(Message['blockedByDOMPolicy'] = 1209)] = 'blockedByDOMPolicy';
  // 1301 - 1400 Styles
  // 1401 - 1500 Components
  Message[(Message['missingElementDefinition'] = 1401)] =
    'missingElementDefinition';
  // 1501 - 1600 Context and Dependency Injection
  Message[(Message['noRegistrationForContext'] = 1501)] =
    'noRegistrationForContext';
  Message[(Message['noFactoryForResolver'] = 1502)] = 'noFactoryForResolver';
  Message[(Message['invalidResolverStrategy'] = 1503)] =
    'invalidResolverStrategy';
  Message[(Message['cannotAutoregisterDependency'] = 1504)] =
    'cannotAutoregisterDependency';
  Message[(Message['cannotResolveKey'] = 1505)] = 'cannotResolveKey';
  Message[(Message['cannotConstructNativeFunction'] = 1506)] =
    'cannotConstructNativeFunction';
  Message[(Message['cannotJITRegisterNonConstructor'] = 1507)] =
    'cannotJITRegisterNonConstructor';
  Message[(Message['cannotJITRegisterIntrinsic'] = 1508)] =
    'cannotJITRegisterIntrinsic';
  Message[(Message['cannotJITRegisterInterface'] = 1509)] =
    'cannotJITRegisterInterface';
  Message[(Message['invalidResolver'] = 1510)] = 'invalidResolver';
  Message[(Message['invalidKey'] = 1511)] = 'invalidKey';
  Message[(Message['noDefaultResolver'] = 1512)] = 'noDefaultResolver';
  Message[(Message['cyclicDependency'] = 1513)] = 'cyclicDependency';
  Message[(Message['connectUpdateRequiresController'] = 1514)] =
    'connectUpdateRequiresController';
})(Message || (Message = {}));

/**
 * Determines whether or not an object is a function.
 * @public
 */
export const isFunction = (object) => typeof object === 'function';
/**
 * Determines whether or not an object is a string.
 * @public
 */
export const isString = (object) => typeof object === 'string';
/**
 * A function which does nothing.
 * @public
 */
export const noop = () => void 0;
