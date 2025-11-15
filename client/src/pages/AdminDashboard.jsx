import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { MdEvent, MdConfirmationNumber, MdExitToApp, MdAdd, MdDelete, MdEdit, MdPeople, MdAttachMoney } from 'react-icons/md';
import { BiCalendar, BiTime, BiMoney, BiMapPin } from 'react-icons/bi';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'create', or 'bookings'
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalTickets: 0,
    totalBookings: 0,
    totalRevenue: 0,
    allEvents: [],
    allBookings: []
  });

  // Form state for creating events
  const [formData, setFormData] = useState({
    owner: 'Admin',
    title: '',
    description: '',
    organizedBy: '',
    eventDate: '',
    eventTime: '',
    location: '',
    ticketPrice: 0,
    likes: 0
  });

  const [eventImage, setEventImage] = useState(null);

  useEffect(() => {
    checkAuthentication();
    fetchDashboardStats();
  }, []);

  const checkAuthentication = () => {
    const isAdmin = localStorage.getItem('isAdmin');
    const adminToken = localStorage.getItem('adminToken');
    
    if (isAdmin === 'true' && adminToken) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  const fetchDashboardStats = async () => {
    try {
      const eventsResponse = await axios.get('/createEvent');
      const events = eventsResponse.data;
      
      const ticketsResponse = await axios.get('/tickets/all');
      const tickets = ticketsResponse.data || [];
      
      const bookingsResponse = await axios.get('/bookings');
      const bookings = bookingsResponse.data || [];
      
      // Calculate total revenue
      const totalRevenue = bookings.reduce((sum, booking) => {
        if (booking.paymentStatus === 'Completed' && booking.bookingStatus === 'Confirmed') {
          return sum + booking.totalAmount;
        }
        return sum;
      }, 0);
      
      setStats({
        totalEvents: events.length,
        totalTickets: tickets.length,
        totalBookings: bookings.filter(b => b.bookingStatus === 'Confirmed').length,
        totalRevenue: totalRevenue,
        allEvents: events,
        allBookings: bookings
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdmin');
    setIsAuthenticated(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setEventImage(file);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    
    if (eventImage) {
      data.append('image', eventImage);
    }

    try {
      await axios.post('/createEvent', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert('Event created successfully!');
      
      // Reset form
      setFormData({
        owner: 'Admin',
        title: '',
        description: '',
        organizedBy: '',
        eventDate: '',
        eventTime: '',
        location: '',
        ticketPrice: 0,
        likes: 0
      });
      setEventImage(null);
      
      // Refresh stats
      fetchDashboardStats();
      setActiveTab('overview');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`/event/${eventId}`);
        alert('Event deleted successfully!');
        fetchDashboardStats();
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-2xl font-bold text-primary">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Manage events and track registrations</p>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              <MdExitToApp className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalEvents}</p>
                <p className="text-sm text-gray-500 mt-1">Events created</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <MdEvent className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalBookings}</p>
                <p className="text-sm text-gray-500 mt-1">Confirmed</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl">
                <MdPeople className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">₹ {stats.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">From bookings</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-xl">
                <MdAttachMoney className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Events Overview
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`px-6 py-4 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeTab === 'create'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <MdAdd className="w-5 h-5" />
                Create Event
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-6 py-4 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeTab === 'bookings'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <MdPeople className="w-5 h-5" />
                Booking Details
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                {stats.allEvents.length > 0 ? (
                  <div className="space-y-4">
                    {stats.allEvents.map((event) => {
                      const registrations = stats.totalTickets; // You can calculate per event
                      return (
                        <div key={event._id} className="border border-gray-200 rounded-xl p-5 hover:border-primary transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{event.description}</p>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <BiCalendar className="w-4 h-4 text-primary" />
                                  {event.eventDate?.split('T')[0]}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <BiTime className="w-4 h-4 text-primary" />
                                  {event.eventTime}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <BiMapPin className="w-4 h-4 text-primary" />
                                  {event.location}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <BiMoney className="w-4 h-4 text-primary" />
                                  Rs. {event.ticketPrice}
                                </div>
                              </div>

                              <div className="flex items-center gap-4 mt-4">
                                <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                                  {event.likes || 0} Likes
                                </span>
                                <span className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium">
                                  Organized by: {event.organizedBy}
                                </span>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleDeleteEvent(event._id)}
                              className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Event"
                            >
                              <MdDelete className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MdEvent className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No events created yet</p>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primarydark transition-colors"
                    >
                      Create Your First Event
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'create' && (
              <form onSubmit={handleCreateEvent} className="max-w-3xl">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter event title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Describe your event"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organized By *
                      </label>
                      <input
                        type="text"
                        name="organizedBy"
                        value={formData.organizedBy}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Organization name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location *
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Event location"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Date *
                      </label>
                      <input
                        type="date"
                        name="eventDate"
                        value={formData.eventDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Time *
                      </label>
                      <input
                        type="time"
                        name="eventTime"
                        value={formData.eventTime}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ticket Price *
                      </label>
                      <input
                        type="number"
                        name="ticketPrice"
                        value={formData.ticketPrice}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Image
                    </label>
                    <input
                      type="file"
                      onChange={handleImageChange}
                      accept="image/*"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primarydark transition-colors"
                    >
                      Create Event
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('overview')}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}

            {activeTab === 'bookings' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">All Bookings</h2>
                  <div className="text-sm text-gray-500">
                    Total: {stats.totalBookings} confirmed bookings
                  </div>
                </div>

                {stats.allBookings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Booking ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Event
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date & Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Booked On
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {stats.allBookings.map((booking) => (
                          <tr key={booking._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                              {booking._id.slice(-8)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{booking.name}</div>
                              <div className="text-sm text-gray-500">{booking.email}</div>
                              <div className="text-sm text-gray-500">{booking.phone}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{booking.eventTitle}</div>
                              <div className="text-sm text-gray-500">{booking.eventLocation}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{booking.eventDate}</div>
                              <div className="text-sm text-gray-500">{booking.eventTime}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {booking.ticketQuantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              ₹ {booking.totalAmount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                booking.bookingStatus === 'Confirmed' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {booking.bookingStatus}
                              </span>
                              <div className="mt-1">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  booking.paymentStatus === 'Completed' 
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {booking.paymentStatus}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(booking.createdAt).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MdPeople className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No bookings yet</p>
                    <p className="text-gray-400 text-sm mt-2">Bookings will appear here when users book tickets</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
