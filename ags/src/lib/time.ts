import { Variable } from "astal";

let regex = new RegExp(/ (a.m.|p.m.)/, "i");

export const currentTime = Variable("").poll(1000, () =>
  new Date()
    .toLocaleTimeString("ro-RO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
    .replace(regex, ""),
);

export const currentDate = Variable("").poll(60000, () => {
  const date = new Date();
  const day = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][date.getDay()];
  const month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ][date.getMonth()];
  const year = date.getFullYear();
  const normalDate = String(date.getDate()).padStart(2, "0");
  return `${day}, ${normalDate} ${month} ${year}`;
});

export const currentSeconds = Variable("").poll(1000, () =>
  new Date()
    .toLocaleTimeString("ro-RO", {
      second: "2-digit",
    })
    .replace(regex, ""),
);
