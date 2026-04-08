//{test,expect} = import '@playwright/test'
import {test,expect} from '@playwright/test'

test('Locators',async  ({page})=>{
    
    await page.goto('https://demoblaze.com/index.html')
// selecting the xpath and performing the click action    
    //await page.locator('id=login2').click()
    //we will try to use the simpler code for efficiency
    await page.click('id=login2')

    await page.fill('id=loginusername','anshuman')

    await page.fill('id=loginpassword','anshuman123')

    await page.click("//button[normalize-space()='Log in']")

    //verifying an element link present or not
    const signin2 = await page.locator('id=signin2')

    await expect(signin2).toBeVisible();

    console.log(signin2);
    
    await page.close()

})
 
//updated