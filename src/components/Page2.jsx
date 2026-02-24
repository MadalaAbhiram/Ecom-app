import { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";

function Page2() {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Header />
      <div className="live-page">
        <div className="live-card">
          <h1>Live Time</h1>
          <p>{currentTime}</p>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Page2;
