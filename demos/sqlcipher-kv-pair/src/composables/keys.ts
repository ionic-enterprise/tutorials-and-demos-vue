export const useKeys = () => ({
  // In a real application, you would likely generate this if it did not exist and
  // then store it somewhere secure such as in Identity Vault or on your backend API.
  //
  // For this demo, we just use a hard coded value to avoid those complications, but
  // DO NOT do this in a real app. If you do, you may as well just not use encryption.
  getDatabaseKey: () => '974bf4fc-d647-4ec3-bd65-814d4d40ae65',
});
