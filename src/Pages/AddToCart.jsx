import React from "react";
import axios from "axios";
import swal from "sweetalert";

export default class ProductDetail extends React.Component{
    state = {
        product: null
    }

    componentDidMount(){
        this.getData()
    }

    getData = () => {
        let id = window.location.pathname.split('/')[2]

        axios.get(`http://localhost:2000/products/${id}`)
        .then(res => {
            // console.log(res)
            this.setState({ product: res.data})
            // console.log(this.state.product)
        })
        .catch(err => {
            console.log(err)
        })
    }

    addToCart = () => {
        let quantity = Number(this.refs.quantity.value)

        
        axios.get(`http://localhost:2000/carts?productID=${this.state.product.id}`)
        .then(res => {
            if(res.data.length === 0){
                if(quantity > this.state.product.stock){
                    swal("Maaf!", "Jumlah produk yang Anda inginkan melebih stok!");
                }else{
                    let postData = {
                        productID: this.state.product.id,
                        userID: localStorage.getItem('id'),
                        quantity: quantity
                    }
                    axios.post(`http://localhost:2000/carts`, postData)
                    .then(res => {
                        swal("Produk ditambahkan ke keranjang!")
                        .then(() => {
                              window.location = '/'
                          });
                    })
                    .catch(err => {
                        console.log(err)
                    })
                }
            }else if(res.data.length === 1){
                if(((quantity) + res.data[0].quantity) > this.state.product.stock){
                    swal("Maaf!", "Jumlah produk yang Anda inginkan melebih stok!");
                }else{
                    axios.patch(`http://localhost:2000/carts/${res.data[0].id}`,  {quantity: Number(res.data[0].quantity) + quantity})
                    .then(() => {
                        swal("Berhasil mengupdate kuantitas!")
                        .then(() => {
                              window.location = '/'
                          });
                    })
                    .catch(err => {
                        console.log(err)
                    })
                }
            }
        })
        .catch(err => {
            console.log(err)
        })
    }

    render(){
        return(
            <div className="container">
                {
                    this.state.product?
                        <div className="row border shadow-lg mt-5 p-3">
                            <div className="col-4">
                                <img src={this.state.product.img} height="300px" alt=""/>
                            </div>
                            <div className="col-8 card">
                                <h5> {this.state.product.name} </h5>
                                <h5> Stock: {this.state.product.stock} </h5>
                                <p> {this.state.product.description} </p>
                                <h4> Rp.{this.state.product.price.toLocaleString()} </h4>
                                <span>
                                    <input type="button" value="-" onClick={() => { this.refs.quantity.value < 2? this.refs.quantity.value = 1 : this.refs.quantity.value--}} />
                                    <input type="number" ref="quantity" value={1} />
                                    <input type="button" value="+" onClick={() => {this.refs.quantity.value++}} />
                                </span>
                                {
                                    localStorage.getItem('id')?
                                        <button className="btn btn-success" onClick={this.addToCart}>Add to Cart</button>
                                        :
                                        <button className="btn btn-success" onClick={() => {swal("Maaf!", "Anda belum login!");}} >Add to Cart</button>
                                }
                            </div>
                        </div>
                        :
                        null
                }
            </div>
        )
    }
}