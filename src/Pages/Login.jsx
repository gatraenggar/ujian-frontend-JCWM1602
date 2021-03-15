import axios from "axios";
import React from "react";

export default class Login extends React.Component{
    state = {
        error: null
    }

    login = () => {
        let inputEmail = this.refs.email.value
        let inputPassword = this.refs.password.value
        let NumberInPassword = 0

        let emailSpec1 = inputEmail.toString().split('@')
        let emailSpec2
        let passwordSpec = inputPassword.toString().split('')
        console.log(passwordSpec)
        
        if(emailSpec1.length === 2){
            emailSpec2 = emailSpec1[1].split('.')
        }

        let passwordAsArray = inputPassword.split('')
        passwordAsArray.forEach(char => {
            if(char >= 0){
                NumberInPassword++
            }
        });

        if(inputEmail[0] >= 0 || emailSpec1.length !== 2 || emailSpec2.length !== 2){
            this.setState({error: 'Email tidak sesuai!'})
        }else{
            if(inputPassword.length < 6 || NumberInPassword === 0){
                this.setState({error: 'Password minimal 6 karakter & mengandung angka!'})
            }else{
                axios.get(`http://localhost:2000/users?email=${inputEmail}`)
                .then(res => {
                    console.log(res)
                    if(res.data.length === 0){
                        axios.post(`http://localhost:2000/users`, {email: inputEmail, password: inputPassword})
                        .then(res => {
                            console.log('Post akun baru berhasil')
                            localStorage.setItem('id', res.data.id)
                            localStorage.setItem('email', res.data.email)
                            window.location = '/'
                        })
                        .catch(err => {
                            console.log(err)
                        })
                    }else if(res.data.length === 1){
                        if(inputPassword === res.data[0].password){
                            localStorage.setItem('id', res.data[0].id)
                            localStorage.setItem('email', res.data[0].email)
                            window.location = '/'
                        }else{
                            this.setState({error: 'Password salah!'})
                        }
                    }
                })
                .catch(err => {
                    console.log(err)
                })
            }
        }

    }

    render(){
        return(
            <div className="d-flex justify-content-center mt-5">
                <div className="card p-5 border shadow-lg" style={{width: '40vw'}}>
                    <label htmlFor="email">Email</label>
                    <input type="email" ref="email" name="email" id=""/>

                    <label htmlFor="password">Password</label>
                    <input type="password" ref="password" name="password" id=""/>

                    <p className="text-danger">
                        {
                            this.state.error?
                                this.state.error
                                :
                                null
                        }
                        </p>

                    <input type="submit" value="Login" className="mt-2" onClick={this.login} />
                </div>
            </div>
        )
    }
}