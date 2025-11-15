/* eslint-disable react/jsx-key */
import axios from "axios";
import { useEffect, useState } from "react"
import { Link } from "react-router-dom";
import { BsArrowRightShort } from "react-icons/bs";
import { BiLike } from "react-icons/bi";

  export default function IndexPage() {
    const [events, setEvents] = useState([]);

   //! Fetch events from the server ---------------------------------------------------------------
    useEffect(() => {
      
      axios
        .get("/createEvent")
        .then((response) => {
          setEvents(response.data);
        })
        .catch((error) => {
          console.error("Error fetching events:", error);
        });
    }, []);
    
  //! Like Functionality --------------------------------------------------------------
    const handleLike = (eventId) => {
      axios
        .post(`/event/${eventId}`)
        .then((response) => {
            setEvents((prevEvents) =>
            prevEvents.map((event) =>
              event._id === eventId
                ? { ...event, likes: event.likes + 1 }
                : event
            )
          );
          console.log("done", response)
        })
        .catch((error) => {
          console.error("Error liking ", error);
        });
    };
  

    return (
      <>
      <div className="flex flex-col">
        {/* Banner Image */}
        <div className="hidden sm:block" >
          <div className="flex item-center inset-0">
            <img src="../src/assets/intro.jpeg" alt="College Event Banner" className='w-full'/> 
          </div>
        </div>

        {/* Events Section with Catchy Heading */}
        <div className="px-10 py-12 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                Upcoming Events
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover exciting events happening on campus. Book your tickets now and don't miss out!
              </p>
              <div className="w-24 h-1 bg-primary mx-auto mt-6 rounded-full"></div>
            </div>

            {/* Events Grid */}
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        
        {/*-------------------------- Checking whether there is a event or not-------------------  */}
        {events.length > 0 ? events.map((event) => {
          const eventDate = new Date(event.eventDate);
          const currentDate = new Date();
          
          //! Check the event date is passed or not --------------------------------------------------------------------------------------- 
          if (eventDate > currentDate || eventDate.toDateString() === currentDate.toDateString()){
            return (
              <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group" key={event._id}>
              <div className='relative overflow-hidden aspect-16:9'>
              {event.image ? (
                <img
                  src={`http://localhost:4000/uploads/${event.image}`}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x300?text=Event+Image';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-primarydark flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
                <div className="absolute flex gap-4 bottom-3 right-3">
                  <button 
                    onClick={() => handleLike(event._id)}
                    className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg transition-all hover:bg-primary hover:text-white"
                  >
                    <BiLike className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{event.title.toUpperCase()}</h3>
                  <div className="flex gap-1 items-center text-red-600 text-sm font-semibold ml-2">
                    <BiLike className="w-4 h-4" /> 
                    {event.likes || 0}
                  </div>
                </div>
                
                <div className="flex text-sm justify-between text-gray-700 font-semibold mb-3">
                  <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {event.eventDate.split("T")[0]}
                  </div>
                  <div className="text-primary font-bold">
                    {event.ticketPrice === 0 ? 'Free' : 'Rs. ' + event.ticketPrice}
                  </div>
                </div>

                <p className="text-xs text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                
                <div className="text-xs text-gray-500 mb-4">
                  <span className="font-semibold">Organized by:</span> {event.organizedBy}
                </div>

                <Link to={'/event/'+event._id} className="block">
                  <button className="w-full bg-primary hover:bg-primarydark text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                    Book Now
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </Link>
              </div>
            </div>
            )
          }
          return null;
        }) : (
          <div className="col-span-full text-center py-20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No Events Available</h3>
            <p className="text-gray-500">Check back soon for upcoming events!</p>
          </div>
        )}
        </div>
          </div>
        </div>
      </div>
      </>
        
      )
  }
  