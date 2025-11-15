import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

export default function BookingConfirmation() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    axios.get(`/bookings/${id}`)
      .then(response => {
        setBooking(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching booking:", error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">Booking not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Message */}
        <div className="bg-white rounded-lg p-8 mb-6 text-center">
          <div className="flex justify-center mb-6">
            <FaCheckCircle className="text-green-500 text-7xl animate-bounce" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎉 Booking Confirmed! 🎉
          </h1>
          
          <p className="text-lg text-gray-600 mb-2">
            Thank you for booking with EventoEMS!
          </p>
          
          <p className="text-md text-gray-500 mb-6">
            Your ticket has been successfully booked. We will contact you soon with further details.
          </p>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
            Booking Details
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg text-gray-700 mb-3">Personal Information</h3>
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="text-md font-semibold text-gray-800">{booking.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="text-md font-semibold text-gray-800">{booking.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="text-md font-semibold text-gray-800">{booking.phone}</p>
              </div>
            </div>

            {/* Event Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg text-gray-700 mb-3">Event Information</h3>
              <div>
                <p className="text-sm text-gray-500">Event Name</p>
                <p className="text-md font-semibold text-gray-800">{booking.eventTitle}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <p className="text-md font-semibold text-gray-800">
                  {booking.eventDate} at {booking.eventTime}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="text-md font-semibold text-gray-800">{booking.eventLocation}</p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold text-lg text-gray-700 mb-3">Payment Summary</h3>
            <div className="bg-gray-50 rounded p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Ticket Quantity:</span>
                <span className="font-semibold">{booking.ticketQuantity} ticket(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price per Ticket:</span>
                <span className="font-semibold">₹ {booking.ticketPrice}</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-lg font-bold text-gray-800">Total Amount:</span>
                <span className="text-lg font-bold text-blue-600">₹ {booking.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  {booking.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-lg p-8 mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Ticket QR Code</h2>
          <p className="text-sm text-gray-600 mb-4">
            Show this QR code at the event entrance
          </p>
          <div className="flex justify-center">
            <img 
              src={booking.qrCode} 
              alt="Ticket QR Code" 
              className="w-64 h-64 border-4 border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
              Back to Home
            </button>
          </Link>
          <button 
            onClick={() => window.print()}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
            Print Ticket
          </button>
        </div>

        {/* Additional Information */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mt-6">
          <h3 className="font-semibold text-gray-800 mb-2">📌 Important Notes:</h3>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>Please arrive 30 minutes before the event starts</li>
            <li>Bring a valid ID along with your ticket</li>
            <li>Save or print your QR code for entry</li>
            <li>Our team will contact you via email/phone for any updates</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
