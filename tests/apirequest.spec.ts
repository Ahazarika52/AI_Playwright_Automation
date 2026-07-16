import {test,expect} from '@playwright/test';
import { request } from 'http';


test("Get request" , async ({request}) => {

 let response =    await request.post(
        'https://rahulshettyacademy.com/api/ecom/auth/login', {
            data: {
                userEmail: "ahazarika52@gmail.com",
                userPassword: "Anshuman@123"
            }
        });

  await response.json()
  await response.headers()

  
  console.log(await response.json())   
  console.log(await response.headers()) 
})