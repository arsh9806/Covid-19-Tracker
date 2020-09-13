import React, { useState, useEffect } from 'react';
import { Card, CardContent, FormControl, Select, MenuItem } from "@material-ui/core";
import InfoBox from "./components/InfoBox";
import Table from "./components/Table";
import { sortData, prettyPrintStat } from './utils'
import Map from "./components/Map";
import LineGraph from "./components/LineGraph";
import 'leaflet/dist/leaflet.css'
import './App.css';


function App() {

  // ------------------------State Declarations 
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({
    lat: 34.80746, lng: -40.4796
  });
  const [mapCountries, setMapCountries] = useState([]);
  const [mapZoom, setMapZoom] = useState(3);
  const [casesType, setCaseType] = useState("cases");

  useEffect(() => {
    async function fetchWorldWideData() {
      const url = "https://disease.sh/v3/covid-19/all";
      await fetch(url)
        .then(response => response.json())
        .then(data => setCountryInfo(data));
    }
    fetchWorldWideData();
  }, [])

  // ------------------------Pulling Data for particular country
  useEffect(() => {
    async function getCountriesData() {
      let url = "https://disease.sh/v3/covid-19/countries";
      await fetch(url)
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map(country => ({
            name: country.country,
            countryCode: country.countryInfo.iso2
          }));
          const sortedData = sortData(data);
          setTableData(sortedData);
          setCountries(countries);
          setMapCountries(data);
        });
    }
    getCountriesData()

  }, [])


  // ------------------------Pulling Data on country Change 
  const countryChange = async (event) => {
    const countryCode = event.target.value;
    console.log(countryCode)
    const url = (countryCode === 'worldwide') ? 'v3/covid-19/all' : `v3/covid-19/countries/${countryCode}`;
    console.log(url);
    await fetch(`https://disease.sh/${url}`)
      .then(response => response.json())
      .then(data => {
        console.log(data)
        setCountryInfo(data);
        setCountry(countryCode);
        if(countryCode === "worldwide"){
          setMapCenter([])
        }
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      })
  }

  // --------------------------return
  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>Covid-19 Tracker</h1>
          <FormControl className="app__dropdown">
            <Select variant="outlined"
              value={country}
              onChange={countryChange}>
              <MenuItem key={0} value="worldwide">Worldwide</MenuItem>
              {
                countries.map((country, index) => (
                  <MenuItem key={index} value={country.countryCode}>{country.name}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">

          <InfoBox isRed active={casesType == "cases"} onClick={e => setCaseType("cases")} title="CoronaVirus Cases" cases={prettyPrintStat(countryInfo.todayCases)} total={prettyPrintStat(countryInfo.cases)} />
          <InfoBox active={casesType == "recovered"} onClick={e => setCaseType("recovered")} title="Recovered" cases={prettyPrintStat(countryInfo.todayRecovered)} total={prettyPrintStat(countryInfo.recovered)} />
          <InfoBox isRed active={casesType == "deaths"} onClick={e => setCaseType("deaths")} title="Deaths" cases={prettyPrintStat(countryInfo.todayDeaths)} total={prettyPrintStat(countryInfo.deaths)} />

        </div>

        <Map
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Live Cases By Country</h3>
          <Table countries={tableData} />
          <h3>Worldwide New Cases</h3>
          <LineGraph casesType={casesType}/>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
