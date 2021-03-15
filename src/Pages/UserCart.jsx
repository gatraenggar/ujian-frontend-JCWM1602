import React from 'react'
import axios from 'axios'

import swal from 'sweetalert';

export default class Cart extends React.Component{

    state = {
        dataCarts: null,
        dataProducts: null,
        totalItem: 0,
        totalPrice: 0
    }

    componentDidMount(){
        this.getDataCarts()
    }

    getDataCarts = () => {
        let id = localStorage.getItem('id')

        axios.get(`http://localhost:2000/carts?userID=${id}`)
        .then((res) => {
            let linkURLToGetDataProduct = ''
            
            res.data.forEach((value, index) => {
                linkURLToGetDataProduct += `id=${value.productID}&`
            })
            res.data.sort((a, b) => {
                return a.productID - b.productID
            })

            this.setState({dataCarts: res.data})
            console.log(this.state.dataCarts)

            axios.get(`http://localhost:2000/products?${linkURLToGetDataProduct}`)
            .then((res) => {
                this.setState({dataProducts: res.data})
                
                this.getOrderSummary()
            })
            .catch((err) => {
                console.log(err)
            })
        })

        .catch((err) => {
            console.log(err)
        })
    }

    getOrderSummary = () => {
        let totalItem = 0
        let totalPrice = 0

        this.state.dataCarts.forEach((value, index) => {
            totalItem += value.quantity
            totalPrice += this.state.dataProducts[index].price * value.quantity
        })

        this.setState({totalItem: totalItem, totalPrice: totalPrice})
    }

    updateQuantityProduct = (button, idCart, quantity) => {
        let quantitySebelumnya = quantity
        let quantityTerbaru = 0

        if(button === 'Plus'){
            quantityTerbaru = quantitySebelumnya + 1
        }else{
            quantityTerbaru = quantitySebelumnya - 1
        }
        
        axios.patch(`http://localhost:2000/carts/${idCart}`, {quantity: quantityTerbaru})
        .then((res) => {
            if(res.status === 200){
                this.getDataCarts()
            }
        })  
        .catch((err) => {
            console.log(err)
        })
    }

    deleteProduct = (idCart) => {
        swal({
            title: "Are you sure want to delete this product?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
          })
          .then((willDelete) => {
            if(willDelete){
                axios.delete(`http://localhost:2000/carts/${idCart}`)
                .then((res) => {
                    swal({
                        title: "Product delete succesfull!",
                        icon: "success",
                        button: "Ok",
                    });

                    window.location = '/user-cart/' + localStorage.getItem('id')
                })
                .catch((err) => {
                    swal({
                        title: {err},
                        icon: "cancel",
                        button: "Ok",
                    });
                })
            } else {
              
            }
          });
    }

    createTransaction = () => {
        let idUSer = localStorage.getItem('id')
        
        let totalPrice = this.state.totalPrice

        let detailItems = this.state.dataCarts.map((value, index) => {
            return{
                    productName: this.state.dataProducts[index].name,
                    productID: value.productID,
                    productPrice: this.state.dataProducts[index].price,
                    productQuantity: value.quantity,
                    productImage: this.state.dataProducts[index].img
            }
        })

        const dataToSend = {
            idUser: idUSer,
            status: 'Unpaid',
            total: totalPrice,
            detail: detailItems
        }

        // Nge-create Transaction
        axios.post('http://localhost:2000/transactions', dataToSend)
        .then((res) => {
            // Setelah Berhasil Nge-create Transaction > Update Stock Productnya
            let idTransaction = res.data.id // Id Untuk Redirect ke Halaman Checkout

            this.state.dataCarts.forEach((value, index) => {
                let stockSebelumnya = this.state.dataProducts[index].stock
                let stockTerbaru = stockSebelumnya - value.quantity

                axios.patch(`http://localhost:2000/products/${value.productID}`, {stock: stockTerbaru})
                .then((res) => {
                    // Setelah Berhasil Update Stock > Delete Data Carts User

                    axios.delete(`http://localhost:2000/carts/${value.id}`)
                    .then((res) => {
                        window.location = '/transaction-history/' + idTransaction 
                    })
                    .catch((err) => {
                        console.log(err)
                    })
                })
                .catch((err) => {
                    console.log(err)
                })
            })
        })
        .catch((err) => {
            console.log(err)
        })
    }

    render(){
        if(this.state.dataCarts === null || this.state.dataProducts === null){
            return(
                null
            )
        }

        return(
            <>
                <div className = 'bg-light'>
                    <div className ='container'>
                        <div className = 'row'>

                            <div className='col-12 col-sm-12 col-md-12 col-lg-8 col-xl-8'>
                                <div className='p-2 my-5 bg-white' style={{borderRadius: '3px'}}>
                                    <div className='col-12 mt-3'>
                                        <h3>
                                            Shopping Cart
                                        </h3>
                                        <hr/>
                                    </div>
                                    {
                                        this.state.dataCarts.map((value, index) => {
                                            return(
                                                <div className='row px-0 py-3 mt-4 mb-4'>
                                                    <div className ='col-4'>
                                                        <img src={this.state.dataProducts[index].img} className='ml-3' style={{width:'100%'}} />
                                                    </div>
                                                    <div className ='col-8'>
                                                        <div className="ml-3">
                                                            <div>
                                                                <h4 className='funniture-third' style={{lineHeight: '6px'}}>
                                                                    {this.state.dataProducts[index].name}
                                                                </h4>
                                                                <h4 style={{lineHeight: '5px'}}>
                                                                    Rp.{this.state.dataProducts[index].price.toLocaleString()}
                                                                </h4>
                                                            </div>
                                                            <div className='d-flex justify-content-between mt-4'>
                                                                <div>
                                                                    <button disabled={value.quantity === 1? true : false} className='btn btn-warning px-2 font-weight-bold' onClick={() => this.updateQuantityProduct('Minus', value.id, value.quantity)}>
                                                                        -
                                                                    </button>
                                                                    <span className='mx-4'>
                                                                        {value.quantity}
                                                                    </span>
                                                                    <button disabled={value.quantity === this.state.dataProducts[index].stock? true : false} className='btn btn-warning px-1 font-weight-bold' onClick={() => this.updateQuantityProduct('Plus', value.id, value.quantity)}>
                                                                        +
                                                                    </button>
                                                                </div>
                                                                <div className='mr-3'>
                                                                    <button className='btn btn-outline-secondary px-2 funniture-font-size-10' onClick={() => this.deleteProduct(value.id)}>
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>

                            <div className='col-12 col-sm-12 col-md-12 col-lg-4 col-xl-4 ' style={{height: '400px'}}>
                                <div className='p-4 mt-0 mt-md-5 bg-white' style={{borderRadius: '3px'}}>
                                    <div className='col-12 mt-3'>
                                        <h5>
                                            Order Summary
                                        </h5>
                                        <hr/>
                                        <div className ='d-flex justify-content-between my-2'>
                                            <div>
                                                Total Items :
                                            </div>
                                            <div>
                                                {this.state.totalItem} Item
                                            </div>
                                        </div>
                                        <hr/>
                                    </div>
                                    <div className='col-12 mb-3'>
                                        <div className='d-flex justify-content-between'>
                                            <div>
                                                <h5>
                                                    Total : 
                                                </h5>
                                            </div>
                                            <div>
                                                <h5 className='font-weight-bold'>
                                                    Rp.{this.state.totalPrice.toLocaleString()}
                                                </h5>
                                            </div>
                                        </div> 
                                    </div> 
                                </div>
                                <div className='mt-4'>
                                    <div>
                                        {
                                            this.state.dataCarts.length === 0?
                                                null
                                            :    
                                                <input type='button' value='Checkout' className ='w-100 btn btn-primary font-weight-bold' onClick={this.createTransaction} />
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}

// import axios from "axios";
// import React from "react";
// import swal from "sweetalert";

// export default class UserCart extends React.Component{
//     state = {
//         userCart: null,
//         productData: null,
//         totalPrice: 0
//     }

//     componentDidMount(){
//         this.getCartProducts()
//     }

//     getCartProducts = () => {
//         axios.get(`http://localhost:2000/carts?userID=${localStorage.getItem('id')}`)
//         .then(res => {
//             this.setState({userCart: res.data})

//             let urlToGetProducts = ''
//             res.data.forEach(value => {
//                 urlToGetProducts += `id=${value.productID}&`
//             })
//             axios.get(`http://localhost:2000/products?${urlToGetProducts}`)
//             .then(res => {
//                 this.setState({productData: res.data})
//                 console.log(this.state.productData)
//             })
//             .catch(err => {
//                 console.log(err)
//             })
//         })
//         .catch(err => {
//             console.log(err)
//         })
//     }

//     changeQuantity = (operator, index) => {
//         axios.get(`http://localhost:2000/carts/${index+1}`)
//         .then((res) => {
//                 if(operator === '+' && (this.state.userCart[index].quantity) <= this.state.productData[index].stock){
//                     axios.patch(`http://localhost:2000/carts/${index+1}`, {quantity: this.state.userCart[index].quantity++})
//                     .then(res => {
//                         console.log(res)
//                         // this.getCartProducts()
//                         // window.location = `/user-cart/${localStorage.getItem('id')}`
//                     })
//                     .catch(err => {
//                         console.log(err)
//                     })
//                 }else if(operator === '-' && this.state.userCart[index].quantity >= 1){
//                     axios.patch(`http://localhost:2000/carts/${index+1}`, {quantity: this.state.userCart[index].quantity--})
//                     .then(res => {
//                         // this.getCartProducts()
//                         // window.location = `/user-cart/${localStorage.getItem('id')}`
//                     })
//                     .catch(err => {
//                         console.log(err)
//                     })
//                 }else{
//                     swal("Maaf!", "Permintaan Anda di luar stok tersedia!");
//                 }
//         })
//         .catch(err => {
//             console.log(err)
//         })
//     }

//     checkout = () => {
//         let tes = this.state.productData
//         console.log(tes.id)

//         let productDetail = this.state.productData.map((value, index) => {
//             return{
//                     productName: value.name,
//                     productPrice: value.price,
//                     productQuantity: this.state.userCart[index].quantity,
//                     productImage: value.img
//             }
//         })

//         let totalPrice = 0

//         this.state.userCart.forEach((value, index) => {
//             totalPrice += this.state.dataProducts[index].price * value.quantity
//         })

//         this.setState({totalPrice: totalPrice})

//         const postData = {
//                 userID: localStorage.getItem('id'),
//                 status: 'Unpaid',
//                 total: this.state.totalPrice,
//                 detail: productDetail
//             }

//         axios.post('http://localhost:2000/transactions', postData)
//         .then(res => {
//             let TransactionID = res.data.id // Id Untuk Redirect ke Halaman Checkout

//             this.state.userCart.forEach((value, index) => {
//                 let updatedStock = this.state.productData[index].stock - value.quantity

//                 axios.patch(`http://localhost:2000/products/${value.productID}`, {stock: updatedStock})
//                 .then((res) => {
//                         // Setelah Berhasil Update Stock > Delete Data Carts User

//                     axios.delete(`http://localhost:2000/carts/${value.id}`)
//                     .then((res) => {
//                         window.location = '/transaction-history/' + TransactionID 
//                     })
//                     .catch((err) => {
//                         console.log(err)
//                     })
//                 })
//                 .catch(err => {
//                     console.log(err)
//                 })
//             })
//         })
//         .catch(err => {
//             console.log(err)
//         })

//     }

//     render(){
//         if(this.state.userCart === null || this.state.productData === null){
//             <div>
//                 Loading ...
//             </div>
//         }
//         return(
//             <div className="container py-5">
//                 <h3>User Cart</h3>
//                 {
//                     this.state.productData?
//                         this.state.productData.map((value,index) => {
//                             return(
//                                 <div className="row border shadow-lg mt-5 p-3">
//                                     <div className="col-4">
//                                         <img src={value.img} height="150px" alt=""/>
//                                     </div>
//                                     <div className="col-8 card">
//                                         <h5> {value.name} </h5>
//                                         <h5> Stock: {value.stock} </h5>
//                                         <p> {value.description} </p>
//                                         <h4> Rp.{value.price.toLocaleString()} </h4>
//                                         <span>
//                                             <input type="button" value="-" onClick={() => { this.changeQuantity('-', index) }} />
//                                             {/* <input type="number" value={this.state.userCart[index].quantity} /> */}
//                                             <span>
//                                                 {this.state.userCart[index].quantity}
//                                             </span>
//                                             <input type="button" value="+" onClick={() => { this.changeQuantity('+', index) }} />
//                                         </span>
//                                     </div>
//                                 </div>
//                             )
//                         })
//                         :
//                         <h4>Loading...</h4>
//                 }

//                 <button className="btn btn-success" onClick={ this.checkout() } >
//                     Checkout
//                 </button>
//             </div>
//         )
//     }
// }