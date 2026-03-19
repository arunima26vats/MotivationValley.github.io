// Importing required libraries and components
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // For animations
import Confetti from 'react-confetti'; // For confetti effect
import './App.css'; // Styling file

// Path to the background video stored in the public folder
const BACKGROUND_VIDEO = '/ghibli-bg.mp4';

function App() {

  // ================= STATE VARIABLES =================

  // Stores the currently displayed quote
  const [currentQuote, setCurrentQuote] = useState({
    content: "Your limitation—it's only your imagination.",
    author: "Unknown",
    _id: "initial"
  });

  // Stores liked quotes (retrieved from localStorage if available)
  const [likedQuotes, setLikedQuotes] = useState(
    JSON.parse(localStorage.getItem('likes')) || []
  );

  // Controls loading state while fetching new quote
  const [isLoading, setIsLoading] = useState(false);

  // Stores search input for filtering liked quotes
  const [searchTerm, setSearchTerm] = useState("");

  // Controls whether confetti animation is shown
  const [showConfetti, setShowConfetti] = useState(false);

  // Stores current window size (used for confetti dimensions)
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // ================= WINDOW RESIZE HANDLING =================

  // Updates window size when user resizes the browser
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup to avoid memory leaks
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ================= FETCH QUOTE FROM API =================

  // Function to fetch a random quote from API
  const fetchQuote = async () => {
    setIsLoading(true); // Show loader

    try {
      const response = await fetch('https://dummyjson.com/quotes/random');

      // Handle API error
      if (!response.ok) throw new Error("API Issue");

      const data = await response.json();

      // Update current quote
      setCurrentQuote({
        _id: data.id,
        content: data.quote,
        author: data.author
      });

    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false); // Hide loader
    }
  };

  // Fetch a quote when component first loads
  useEffect(() => {
    fetchQuote();
  }, []);

  // ================= USER ACTIONS =================

  // Add current quote to liked list
  const handleLike = () => {
    if (!currentQuote) return;

    // Prevent duplicate likes
    if (!likedQuotes.find(q => q._id === currentQuote._id)) {
      const updated = [...likedQuotes, currentQuote];

      setLikedQuotes(updated);

      // Save updated list to localStorage
      localStorage.setItem('likes', JSON.stringify(updated));
    }
  };

  // Toggle confetti effect (on/off)
  const toggleConfetti = () => {
    setShowConfetti(prev => !prev);
  };

  // Delete a quote from liked list
  const deleteQuote = (id) => {
    const updated = likedQuotes.filter(q => q._id !== id);

    setLikedQuotes(updated);

    // Update localStorage after deletion
    localStorage.setItem('likes', JSON.stringify(updated));
  };

  // ================= UI RENDER =================

  return (
    <div id="app">

      {/* -------- BACKGROUND VIDEO -------- */}
      <div className="bg-container">
        <motion.video
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="bg-video"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={BACKGROUND_VIDEO} type="video/mp4" />
          Your browser does not support the video tag.
        </motion.video>

        {/* Overlay to darken or style the video */}
        <div className="bg-overlay"></div>
      </div>

      {/* -------- CONFETTI EFFECT -------- */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={showConfetti}
          numberOfPieces={120}
          gravity={0.015}
          wind={0.005}
          friction={0.99}
          initialX={0}

          // Custom pastel colors
          colors={['#ffdae9', '#fcc2d7', '#ffb3c1', '#ffe5ec', '#fff0f3']}

          // Custom petal-like shape (sakura effect)
          drawShape={ctx => {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-5, -5, -10, 5, 0, 15);
            ctx.bezierCurveTo(10, 5, 5, -5, 0, 0);
            ctx.fill();
          }}
        />
      )}

      {/* -------- MAIN QUOTE CARD -------- */}
      <main id="quote-card">

        {/* Animate quote transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuote._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6 }}
          >

            {/* Loader while fetching */}
            {isLoading && <div id="loader">Gathering thoughts...</div>}

            {/* Quote content */}
            <div id="quote-content" className={isLoading ? "hidden" : ""}>
              <p id="text">"{currentQuote.content}"</p>
              <h4 id="author">- {currentQuote.author}</h4>
            </div>

          </motion.div>
        </AnimatePresence>

        {/* -------- BUTTON CONTROLS -------- */}
        <div className="controls">

          {/* Fetch new quote */}
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#a2d2ff" }}
            whileTap={{ scale: 0.95 }}
            id="new-quote-btn"
            onClick={fetchQuote}
          >
            New Quote
          </motion.button>

          {/* Like quote */}
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#ffc8dd" }}
            whileTap={{ scale: 0.95 }}
            id="like-btn"
            onClick={handleLike}
          >
            Like
          </motion.button>

          {/* Toggle confetti */}
          <motion.button
            id="sad-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleConfetti}
            style={{
              backgroundColor: showConfetti ? '#bde0fe' : '#fdfaf1',
              border: '2px solid #a2d2ff',
              color: '#457b9d'
            }}
          >
            {showConfetti ? "Stop the Sakura" : "Feeling sad?"}
          </motion.button>

        </div>
      </main>

      {/* -------- LIKED QUOTES SECTION -------- */}
      <section id="favorites-section">

        <div className="flex-header">
          <h2 className="collection-title">
            Collection (<span id="count">{likedQuotes.length}</span>)
          </h2>

          {/* Search by author */}
          <input
            type="text"
            id="search-bar"
            placeholder="Search authors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <ul id="liked-list">
          <AnimatePresence>

            {/* Filter + display liked quotes */}
            {likedQuotes
              .filter(q =>
                q.author.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((q) => (

                <motion.li
                  key={q._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="liked-item"
                >

                  {/* Quote info */}
                  <div className="quote-info">
                    <strong>{q.author}:</strong> {q.content}
                  </div>

                  {/* Delete button */}
                  <button
                    className="delete-btn"
                    onClick={() => deleteQuote(q._id)}
                  >
                    🗑️
                  </button>

                </motion.li>
              ))}
          </AnimatePresence>
        </ul>
      </section>
    </div>
  );
}

// Export component so it can be used in index.js
export default App;