import React from "react";
import Axios from "axios";

import Slider from "react-slick";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export default class LandingPage extends React.Component{
    state = {
        products: null
    }

    componentDidMount(){
        this.getProducts()
    }

    getProducts = () => {
        Axios.get(`http://localhost:2000/products`)
        .then(res => {
            console.log(res.data) // bentuk object
            this.setState({products: res.data}) // Array
            console.log(this.state.products)
        })
        .catch(err => {
            console.log(err)
        })
    }

    render(){
        const settingsDesktop = {
            autoplay: true,
            infinite: true,
            slidesToShow: 3,
            slidesToScroll: 1,
            dots: false
        };

        const settingsMobile = {
            autoplay: true,
            infinite: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            dots: false
        };
        if(this.state.products === null){
            <div>

            </div>
        }
        return(
            <div className="container mt-5 p-5 bg-info">
                <div className="">
                    <h2>Landing Page</h2>
                </div>
                <Slider {...settingsDesktop} className="shadow-lg p-4">
                {
                    this.state.products?
                        this.state.products.map((value, index) => {
                            return(
                                <div onClick={() => {window.location = `/product-detail/${value.id}` }} >
                                    <img src={value.img} height="200px" alt=""/>
                                    <div>
                                        <h5>{value.name}</h5>
                                        <p>{value.stock}</p>
                                        <p>{value.description}</p>
                                        <h6>{value.price}</h6>
                                    </div>
                                </div>
                            )
                        })
                        :
                        null
                }
                </Slider>
            </div>
        )
    }
}

