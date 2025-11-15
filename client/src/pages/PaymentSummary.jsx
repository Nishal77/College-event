import axios from 'axios';
import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom';
import {IoMdArrowBack} from 'react-icons/io'
import Qrcode from 'qrcode';

export default function PaymentSummary() {
    const {id} = useParams();
    const [event, setEvent] = useState(null);
    const [ticketQuantity, setTicketQuantity] = useState(1);
    const [details, setDetails] = useState({
      name: '',
      email: '',
      phone: '',
    });

    const [payment, setPayment] = useState({
      nameOnCard: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
    });
    
    const [redirect, setRedirect] = useState(false);
    const [errors, setErrors] = useState({});
  
    useEffect(()=>{
      if(!id){
        return;
      }
      axios.get(`/event/${id}`).then(response => {
        setEvent(response.data)
      }).catch((error) => {
        console.error("Error fetching events:", error);
      });
    }, [id]);
    
    
    if (!event) return '';

    // Validation function
    const validateForm = () => {
      const newErrors = {};
      
      // Validate personal details
      if (!details.name.trim()) newErrors.name = 'Name is required';
      if (!details.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(details.email)) {
        newErrors.email = 'Email is invalid';
      }
      if (!details.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\d{10}$/.test(details.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Phone number must be 10 digits';
      }
      
      // Validate payment details
      if (!payment.nameOnCard.trim()) newErrors.nameOnCard = 'Name on card is required';
      if (!payment.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!/^\d{16}$/.test(payment.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Card number must be 16 digits';
      }
      if (!payment.expiryDate.trim()) {
        newErrors.expiryDate = 'Expiry date is required';
      } else if (!/^\d{2}\/\d{2}$/.test(payment.expiryDate)) {
        newErrors.expiryDate = 'Expiry date must be MM/YY format';
      }
      if (!payment.cvv.trim()) {
        newErrors.cvv = 'CVV is required';
      } else if (!/^\d{3}$/.test(payment.cvv)) {
        newErrors.cvv = 'CVV must be 3 digits';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleChangeDetails = (e) => {
      const { name, value } = e.target;
      setDetails((prevDetails) => ({
        ...prevDetails,
        [name]: value,
      }));
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({...prev, [name]: ''}));
      }
    };
  
    const handleChangePayment = (e) => {
      const { name, value } = e.target;
      
      // Format card number with spaces
      if (name === 'cardNumber') {
        const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
        setPayment((prevPayment) => ({
          ...prevPayment,
          [name]: formatted,
        }));
      } 
      // Format expiry date
      else if (name === 'expiryDate') {
        let formatted = value.replace(/\D/g, '');
        if (formatted.length >= 2) {
          formatted = formatted.slice(0, 2) + '/' + formatted.slice(2, 4);
        }
        setPayment((prevPayment) => ({
          ...prevPayment,
          [name]: formatted,
        }));
      }
      else {
        setPayment((prevPayment) => ({
          ...prevPayment,
          [name]: value,
        }));
      }
      
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({...prev, [name]: ''}));
      }
    };

    // Generate QR Code
    const generateQRCode = async () => {
      try {
        const qrData = `Booking Confirmed\nEvent: ${event.title}\nName: ${details.name}\nEmail: ${details.email}\nDate: ${event.eventDate.split("T")[0]}\nTime: ${event.eventTime}`;
        const qrCode = await Qrcode.toDataURL(qrData);
        return qrCode;
      } catch (error) {
        console.error("Error generating QR code:", error);
        return null;
      }
    };

    // Create Booking
    const handleMakePayment = async (e) => {
      e.preventDefault();
      
      // Validate form
      if (!validateForm()) {
        alert('Please fill all fields correctly');
        return;
      }
      
      try {
        // Generate QR code
        const qrCode = await generateQRCode();
        
        if (!qrCode) {
          alert('Failed to generate QR code. Please try again.');
          return;
        }
        
        // Calculate total amount
        const totalAmount = event.ticketPrice * ticketQuantity;
        
        // Prepare booking data
        const bookingData = {
          name: details.name,
          email: details.email,
          phone: details.phone,
          eventId: event._id,
          eventTitle: event.title,
          eventDate: event.eventDate.split("T")[0],
          eventTime: event.eventTime,
          eventLocation: event.location,
          ticketQuantity: ticketQuantity,
          ticketPrice: event.ticketPrice,
          totalAmount: totalAmount,
          paymentMethod: 'Credit/Debit Card',
          paymentStatus: 'Completed',
          qrCode: qrCode,
          bookingStatus: 'Confirmed'
        };
        
        // Send booking to backend
        const response = await axios.post('/bookings', bookingData);
        
        if (response.data) {
          // Redirect to confirmation page with booking ID
          setRedirect(`/booking-confirmation/${response.data._id}`);
        }
        
      } catch (error) {
        console.error('Error creating booking:', error);
        alert('Payment failed. Please try again.');
      }
    };

    if (redirect) {
      return <Navigate to={redirect} />
    }
    return (
      <>
      <div>
      <Link to={'/event/'+event._id+ '/ordersummary'}>
       <button 
              className='
              inline-flex 
              mt-12
              gap-2
              p-3 
              ml-12
              bg-gray-100
              justify-center 
              items-center 
              text-blue-700
              font-bold
              rounded-sm'
              >
          <IoMdArrowBack 
            className='
            font-bold
            w-6
            h-6
            gap-2'/> 
            Back
          </button>
          </Link>
          </div>
      <div className="ml-12 bg-gray-100 shadow-lg mt-8 p-16 w-3/5 float-left">
          {/* Your Details */}
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-bold mb-4">Your Details</h2>
            <div>
              <input
                type="text"
                name="name"
                value={details.name}
                onChange={handleChangeDetails}
                placeholder="Full Name"
                className={`input-field ml-10 w-80 h-10 bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md p-2.5`}
              />
              {errors.name && <p className="text-red-500 text-sm ml-10 mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <input
                type="email"
                name="email"
                value={details.email}
                onChange={handleChangeDetails}
                placeholder="Email Address"
                className={`input-field w-80 ml-3 h-10 bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md p-2.5`}
              />
              {errors.email && <p className="text-red-500 text-sm ml-3 mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <input
                type="tel"
                name="phone"
                value={details.phone}
                onChange={handleChangeDetails}
                placeholder="Phone Number (10 digits)"
                className={`input-field ml-10 w-80 h-10 bg-gray-50 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md p-2.5`}
              />
              {errors.phone && <p className="text-red-500 text-sm ml-10 mt-1">{errors.phone}</p>}
            </div>
          </div>
  
          {/* Payment Option */}
          <div className="mt-10 space-y-4">
            <h2 className="text-xl font-bold mb-4">Payment Option</h2>
            <div className="ml-10">
              <button type="button" className="px-8 py-3 text-black bg-blue-100 focus:outline border rounded-sm border-gray-300" disabled>
                Credit / Debit Card
              </button>
            </div>
          
            <div>
              <input
                type="text"
                name="nameOnCard"
                value={payment.nameOnCard}
                onChange={handleChangePayment}
                placeholder="Name on Card"
                className={`input-field w-80 ml-10 h-10 bg-gray-50 border ${errors.nameOnCard ? 'border-red-500' : 'border-gray-300'} rounded-md p-2.5`}
              />
              {errors.nameOnCard && <p className="text-red-500 text-sm ml-10 mt-1">{errors.nameOnCard}</p>}
            </div>
            
            <div>
              <input
                type="text"
                name="cardNumber"
                value={payment.cardNumber}
                onChange={handleChangePayment}
                placeholder="Card Number (16 digits)"
                maxLength="19"
                className={`input-field w-80 ml-3 h-10 bg-gray-50 border ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'} rounded-md p-2.5`}
              />
              {errors.cardNumber && <p className="text-red-500 text-sm ml-3 mt-1">{errors.cardNumber}</p>}
            </div>
            
            <div className="flex space-x-4">
              <div>
                <input
                  type="text"
                  name="expiryDate"
                  value={payment.expiryDate}
                  onChange={handleChangePayment}
                  placeholder="MM/YY"
                  maxLength="5"
                  className={`input-field w-60 ml-10 h-10 bg-gray-50 border ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'} rounded-md p-2.5`}
                />
                {errors.expiryDate && <p className="text-red-500 text-sm ml-10 mt-1">{errors.expiryDate}</p>}
              </div>
             
              <div>
                <input
                  type="text"
                  name="cvv"
                  value={payment.cvv}
                  onChange={handleChangePayment}
                  placeholder="CVV"
                  maxLength="3"
                  className={`input-field w-16 h-10 bg-gray-50 border ${errors.cvv ? 'border-red-500' : 'border-gray-300'} rounded-md p-3`}
                />
                {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
              </div>
            </div>
            
            <div className="float-right">
              <p className="text-sm font-semibold pb-2 pt-8">Total : ₹ {event.ticketPrice * ticketQuantity}</p>
              <button 
                type="button" 
                onClick={handleMakePayment}
                className="primary bg-blue-700 text-white px-6 py-3 rounded-md hover:bg-blue-800 transition-colors">
                Make Payment
              </button>
            </div>
          </div>
      </div>
      
      <div className="float-right bg-blue-100 w-1/4 p-5 mt-8 mr-12">
          <h2 className="text-xl font-bold mb-8">Order Summary</h2>
          <div className="space-y-1">
            <p className="text-lg font-semibold">{event.title}</p>
            <p className="text-xs">{event.eventDate.split("T")[0]}</p>
            <p className="text-xs pb-2">{event.eventTime}</p>
            
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm font-semibold">Quantity:</p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                  className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400">
                  -
                </button>
                <span className="px-4">{ticketQuantity}</span>
                <button 
                  onClick={() => setTicketQuantity(ticketQuantity + 1)}
                  className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400">
                  +
                </button>
              </div>
            </div>
            
            <div className="text-sm flex justify-between mt-4">
              <p>Price per ticket:</p>
              <p>₹ {event.ticketPrice}</p>
            </div>
            
            <hr className="my-2 border-t pt-2 border-gray-400" />
            
            <div className="font-bold flex justify-between">
              <p>Total Amount:</p>
              <p>₹ {event.ticketPrice * ticketQuantity}</p>
            </div>
          </div>
        </div>
      </>
    );
}
