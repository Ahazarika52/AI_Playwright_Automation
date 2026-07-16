import { expect } from "@playwright/test"


class LoginPage {
     
   
    constructor(page) {
   

        this.page = page
        this.emailInput = page.getByPlaceholder('email@example.com')


        this.passwordInput = page.getByPlaceholder('enter your passsword')

        this.signInbutton = page.getByRole('button', { name: 'Login' })
        
    } 

    async goto() {
        await this.page.goto('https://rahulshettyacademy.com/client')
    }


   async validateLoginPage(username, password) { 

        await this.emailInput.fill(username)
        await this.passwordInput.fill(password)
        await this.signInbutton.click()
        await expect(this.page).toHaveURL('https://rahulshettyacademy.com/client/#/dashboard/dash')  
    



    }

    
}

export {LoginPage}