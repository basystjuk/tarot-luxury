declare module "tz-lookup" {
  /** Return the IANA timezone name covering the given (latitude, longitude). */
  function tzLookup(lat: number, lon: number): string;
  export default tzLookup;
  export = tzLookup;
}
