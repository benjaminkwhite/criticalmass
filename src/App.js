import React, { useState, useRef, useEffect } from "react";
import moment from "moment-timezone";
import ReactTooltip from "react-tooltip";

import jsonData from "./navigation.json";
import "./styles.scss";

export default function App() {
  const menuArrayRef = useRef([]);
  const ariaCurrentRef = useRef(null);
  const sliderRef = useRef(null);

  const cities = jsonData.cities;

  const [timezone, setTimezone] = useState(null);
  const [tooltip, showTooltip] = useState(true);
  const [slidePostion, setSlidePostion] = useState({
    transform: "translateX(0px)",
    width: "0px",
  });

  const setCurrent = (target) => {
    const selectedLable = document.querySelector(`label[for*="${target.id}"]`);
    setSlidePostion({
      transform: `translateX(${selectedLable.offsetLeft}px)`,
      width: `${selectedLable.offsetWidth}px`,
    });

    ariaCurrentRef.current.removeAttribute("aria-current");
    target.setAttribute("aria-current", "page");
    ariaCurrentRef.current = target;
  };

  useEffect(() => {
    //Ran out of time to add error script
    fetch("http://worldtimeapi.org/api/ip")
    .then((res) => res.json())
    .then((result) => {
      setTimezone(moment.tz(result.datetime, result.timezone));
    });

    const radioButton = menuArrayRef.current.filter((ref) => ref.defaultChecked === true)[0];
    ariaCurrentRef.current = radioButton;
    setCurrent(radioButton);
  }, []);

  useEffect(() => {
    const handlResize = (e) => {
      sliderRef.current.classList.add("resize");

      const radioButton = menuArrayRef.current.filter((ref) => ref.checked === true)[0];
      setCurrent(radioButton);

      const timer = setTimeout(() => {
        sliderRef.current.classList.remove("resize");
      }, 1000);
      return () => clearTimeout(timer);
    };

    window.addEventListener("resize", handlResize);
  });

  const handleChange = (e) => {
    setCurrent(e.target);
    //this is just to show the city.section valuse in use
    console.log(`"${e.target.value}" was selected`);
  };

  const getTime = (city) => {
    let zone = "";
    switch (city) {
      case "cupertino":
        zone = "America/Los_Angeles";
        break;
      case "new-york-city":
        zone = "America/New_York";
        break;
      case "london":
        zone = "Europe/London";
        break;
      case "amsterdam":
        zone = "Europe/Amsterdam";
        break;
      case "tokyo":
        zone = "Asia/Tokyo";
        break;
      case "hong-kong":
        zone = "Asia/Hong_Kong";
        break;
      case "sydney":
        zone = "Australia/Sydney";
        break;
    }

    return timezone ? timezone.clone().tz(zone).format("LTS z") : "Getting local time";
  };

  return (
    <>
      <div role="menubar" id="appmenu">
        {cities &&
          cities.map((city, index) => {
            return (
              <span key={`key${index}`}>
                <input
                  role="menuitem"
                  type="radio"
                  name="cities"
                  defaultValue={city.section}
                  {...(index === 0 && {
                    defaultChecked: "checked",
                    "aria-current": "page",
                  })}
                  id={`tab${index}`}
                  ref={(ref) => {
                    menuArrayRef.current[index] = ref;
                  }}
                  onChange={handleChange}
                />
                <label
                  htmlFor={`tab${index}`}
                  data-tip={getTime(city.section)}
                  //Work around for ReactTooltip autohide not working
                  onMouseEnter={() => showTooltip(true)}
                  onMouseLeave={() => {
                    showTooltip(false);
                    setTimeout(() => showTooltip(true), 50);
                  }}
                >
                  {city.label}
                </label>
              </span>
            );
          })}
        <div
          ref={sliderRef}
          style={slidePostion}
          className="segmented-control__color"
        />
      </div>
      {tooltip && <ReactTooltip place="bottom" type="info" effect="solid" />}
    </>
  );
}
