export const CUSTOM_OPTIONS_HELP = {
  transaction:
    'Choose which transaction this option set applies to. Each transaction can have its own types and sub-types.',
  type: 'A category within the transaction — for example Automobile or Bike under Expense.',
  subType:
    'A specific choice users can pick, with an optional associated cost used for reporting or limits.',
  associatedCost: 'Default or reference cost shown when this sub-type is selected on a transaction.',
  structure:
    'Build your options in three levels: pick a transaction, add types (categories), then add sub-types with costs under each type.',
} as const;
