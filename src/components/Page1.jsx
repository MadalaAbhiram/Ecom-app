import { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";

function Page1() {
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      setCurrentDate(
        now.toLocaleDateString("en-IN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        })
      );
    };

    updateDate();
    const timer = setInterval(updateDate, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Header />
      <div className="live-page">
        <div className="live-card">
          <h1>Live Date</h1>
          <p>{currentDate}</p>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Page1;
