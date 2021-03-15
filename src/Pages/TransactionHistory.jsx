import axios from 'axios'
import React from 'react'
import swal from 'sweetalert';

export default class TransactionHistory extends React.Component{

    state = {
        dataTransaction: null,
        rerender: false
    }

    componentDidMount(){
        this.getDataTransactions()
    }

    getDataTransactions = () => {
        let userID = localStorage.getItem('id')

        axios.get(`http://localhost:2000/transactions?userID=${userID}`)
        .then((res) => {
            this.setState({dataTransaction: res.data})
            console.log(res.data)
        })
        .catch((err) => {
            console.log(err)
        })
    }

    payNow = (transactionID) => {
        swal({
            title: "Selesaikan pembayaran?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
          })
          .then((willPay) => {
            if (willPay) {
                axios.patch(`http://localhost:2000/transactions/${transactionID}`, {status: 'Paid'})
                .then((res) => {
                    
                })
                .catch((err) => {
                    console.log(err)
                })
                swal({
                    title: "Payment success",
                    icon: "success",
                    button: "Ok",
                })
                .then(() => {
                    window.location = '/transaction-history/' + localStorage.getItem('id')
                })
    
            } else {
                swal("Pembayaran dibatalkan")
                .then(() => {
                    window.location = '/transaction-history/' + transactionID
                })
            }
          });        
    }

    cancelPayment = (id) => {
        axios.patch(`http://localhost:2000/transactions/${id}`, {status: 'Cancelled'})
        .then((res) => {
            this.state.dataTransaction[id-1].detail.map((value) => {
                axios.patch(`http://localhost:2000/products?id=${value.productID}`)
                .then(res => {
                    console.log('deleted')
                    this.setState({rerender: true})
                })
                .catch(err => {
                    console.log(err)
                })
            })
            this.setState({rerender: false})
            swal("Pembayaran dibatalkan")
            window.location = '/'
        })
        .catch((err) => {
            console.log(err)
        })
    }

    render(){
        if(this.state.dataTransaction === null){
            return(
                <div>
                    Loading
                </div>
            )
        }
        return(
            <div className='container mt-3'>
                {
                    this.state.dataTransaction.map((value, index) => {
                        return(
                            <div className="row shadow py-4 mb-4" style={{borderRadius: '5px'}}>
                                <div className="col-4">
                                    <h5 style={{lineHeight: '5px'}}>Status :</h5>
                                    <p>{value.status}</p>
                                </div>
                                <div className="col-4 text-center border-left border-right">

                                </div>
                                <div className="col-4 text-right">
                                    {
                                        value.status === 'Unpaid'?
                                            <>
                                                <input type='button' value='Cancel' className='btn btn-danger mr-2' onClick={() => this.cancelPayment(value.id)} />
                                                <input type='button' value='Pay Now' className='btn btn-primary' onClick={() => this.payNow(value.id)} />
                                            </>
                                        :
                                            null
                                    }
                                </div>
                                {
                                    value.detail.map((value, index) => {
                                        return(
                                            <>
                                                <div className="col-2 mt-3 mb-4">
                                                    {/* Image */}
                                                    <img src={value.productImage} width='100px' height='50px' />
                                                </div>
                                                <div className="col-6 mt-3 mb-4">
                                                    {/* Detail Product */}
                                                    <h6 style={{lineHeight: '5px'}}>
                                                        {
                                                            value.productName
                                                        }
                                                    </h6>
                                                    <p>
                                                        {value.productQuantity} Item x Rp.{value.productPrice.toLocaleString('id-ID')}
                                                    </p>
                                                </div>
                                                <div className="col-4 text-right mt-3 mb-4">
                                                    {/* Total Price Per-Product */}
                                                    <p>
                                                        Total Belanja
                                                    </p>
                                                    <h6>
                                                        Rp.{(value.productQuantity * value.productPrice).toLocaleString('id-ID')}
                                                    </h6>
                                                </div>
                                            </>
                                        )
                                    })
                                }
                            </div>
                        )
                    })
                }
            </div>
        )
    }
}