
const { test, expect } = require('@playwright/test');

test('Create, fetch and update a user using ReqRes API', async ({ request }) => {
  const baseURL = 'https://reqres.in/api';

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': 'reqres-free-v1'
  };

  const originalUser = {
    name: 'Anshuman',
    job: 'Software Test Engineer'
  };

  const updatedName = 'Anshuman Prasad';

  // 1. CREATE USER
  const createResponse = await request.post(`${baseURL}/users`, {
    headers,
    data: originalUser
  });

  expect(createResponse.status()).toBe(201);

  const createdUser = await createResponse.json();

  expect(createdUser.name).toBe(originalUser.name);
  expect(createdUser.job).toBe(originalUser.job);
  expect(createdUser.id).toBeTruthy();

  // Store the user ID returned by the API
  const userId = createdUser.id;

  console.log('Created user ID:', userId);
  console.log('Create response:', createdUser);

  // 2. GET USER DETAILS
  const getResponse = await request.get(
    `${baseURL}/users/${userId}`,
    { headers }
  );

  //expect(getResponse.status()).toBe(200);

  const fetchedUser = await getResponse.json();



  // 3. UPDATE USER NAME
  const updateResponse = await request.put(
    `${baseURL}/users/${userId}`,
    {
      headers,
      data: {
        name: updatedName,
        job: originalUser.job
      }
    }
  );

  expect(updateResponse.status()).toBe(200);

  const updatedUser = await updateResponse.json();

  expect(updatedUser.name).toBe(updatedName);
  expect(updatedUser.job).toBe(originalUser.job);

  console.log('Updated user name:', updatedUser.name);
  console.log('Update response:', updatedUser);
});
