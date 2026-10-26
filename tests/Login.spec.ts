import{test,expect} from '@playwright/test';
import { LoginPage } from '../pages/login';



test('Login to site', async ({ page }) => {



    const username = "ahazarika52@gmail.com";
    const password = "Anshuman@123";

   const Login = new LoginPage(page);
   await Login.goto();
   await Login.validateLoginPage(username,password);

   await page.pause();
  


})
//new changes
