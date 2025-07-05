import React, { useEffect, useState } from "react";
import api from "../services/api";
import "../App.css";
import "../styles/quoteoftheday.css";
// Beautiful quotes I like :)

const QuoteOfTheDayPage = () => {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getQuoteOfTheDay()
      .then(setQuote)
      .catch((err) => setError("Could not load quote."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <h1 className="page-title">Quote of the Day</h1>
      <div className="page-content">
        <div className="qotd-quote-box">
          {loading && <div>Loading...</div>}
          {error && <div style={{ color: "red" }}>{error}</div>}
          {quote && (
            <>
              <div className="qotd-quote">“{quote.quote}”</div>
              <div className="qotd-author">— {quote.source}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteOfTheDayPage;
