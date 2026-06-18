export const WORKFLOW_HELP = {
  trigger:
    'A trigger is a rule that runs when all of its conditions match. Add multiple triggers to handle different request types or departments.',
  when: 'Conditions define when this rule applies. All conditions in a trigger must be true (AND logic).',
  fieldType: 'The field to evaluate — for example Request Type, Department, or Amount.',
  operator: 'How to compare the field to your value — equals, not equals, contains, or greater than.',
  value: 'The specific value that must match for this condition to pass.',
  action:
    'What happens when the trigger matches — typically routing the request to approvers or sending a notification.',
  actionType: 'Choose what the workflow should do when conditions are met.',
  users: 'Select one or more users who receive the request when this action runs.',
  test: 'Simulate a sample request to see which trigger would fire first.',
  addCondition: 'Add another condition to the same trigger. All conditions must match.',
  addAction: 'Add another action that runs when this trigger matches.',
} as const;
