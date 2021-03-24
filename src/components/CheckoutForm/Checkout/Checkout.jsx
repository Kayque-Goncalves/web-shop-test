import React, { useState, useEffect } from 'react'
import { Paper, Stepper, Step, StepLabel, Typography, CircularProgress, Divider, Button } from '@material-ui/core'
import { Link, useHistory } from 'react-router-dom'

import useStyles from './styles'
import AddressForm from '../AddressForm'
import PaymentForm from '../PaymentForm'

import { commerce } from '../../../lib/commerce'

const steps = [ 'Shipping address', 'Payment details' ]

const Checkout = ({ cart, order, onCaputureCheckout, error }) => {

    const [ activeStep, setActiveStep ] = useState(0)
    const [ checkoutToken, setCheckoutToken ] = useState(null)
    const [ shippingData, setShippingData ] = useState({})
    const [ isFinished, setIsFinished ] = useState(false)

    const history = useHistory()
    const classes = useStyles()

    useEffect(() => {
        const generateToken = async () => {
            try {
                const token = await commerce.checkout.generateToken(cart.id, { type: 'cart' })

                setCheckoutToken(token)
            } catch (error) {
                history.purchaseState('/')
            }
        }
        
        generateToken()
    }, [cart])

    const nextStep = () => setActiveStep((prevActiveStep) => prevActiveStep + 1)
    const prevStep = () => setActiveStep((prevActiveStep) => prevActiveStep - 1)

    const next = (data) => {
        setShippingData(data)

        nextStep()
    }

    const timeout = () => {
        setTimeout(() => {
            setIsFinished(true)
        }, 3000)
    }

    let Confirmation = () => order.custumer ?(
        <>
            <div>
                <Typography variant="h5"> Thank you for your purchase, { order.custumer.firstname } { order.custumer.lastname } </Typography>
                <Divider className={ classes.divider } />
                <Typography variant="subtitle2"> Order ref: { order.customer_reference } </Typography>
            </div>
            <br />
            <Button component={ Link } to="/" variant="outlined" type="button"> Back to home </Button>
        </>
    ) : isFinished ? (
        <>
            <div>
                <Typography variant="h5"> Thank you for your purchase </Typography>
                <Divider className={ classes.divider } />
            </div>
            <br />
            <Button component={ Link } to="/" variant="outlined" type="button"> Back to home </Button>
        </>
    ) : (
        <div classeName={ classes.spinner }>
            <CircularProgress />
        </div>
    )

    if(error) {
        <>
            <Typography variant="h5">Error: {error}</Typography>
            <br />
            <Button component={ Link } to="/" variant="outlined" type="button"> Back to home </Button>
        </>
    }

    const Form = () => activeStep === 0
        ? <AddressForm checkoutToken={ checkoutToken } next={ next } />
        : <PaymentForm 
            checkoutToken={ checkoutToken } 
            shippingData={shippingData} 
            nextStep={nextStep} 
            prevStep={prevStep}
            onCaputureCheckout={ onCaputureCheckout } 
            timeout={ timeout }
        />

    return (
        <>
            <div className={ classes.toolbar } />
            <main className={ classes.layout }>
                <Paper className={ classes.paper }>
                    <Typography cariant="h4" align="center">Checkout</Typography>
                    <Stepper activeStep={activeStep} className={ classes.stepper }>
                        {steps.map((step) => (
                            <Step key={step}>
                                <StepLabel>{step}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                    {activeStep === steps.length ? <Confirmation /> : checkoutToken && <Form />}
                </Paper>
            </main> 
        </>
    )
}

export default Checkout
