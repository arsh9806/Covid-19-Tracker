import React, { useState, useEffect } from 'react';
import { Card, CardContent, FormControl, Select, MenuItem } from "@material-ui/core";
import InfoBox from "./components/InfoBox";
import Table from "./components/Table";
import {sortData} from './utils'
import Map from "./components/Map";
import LineGraph from "./components/LineGraph";
import './App.css';


function App() {

  // ------------------------State Declarations 
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    async function fetchWorldWideData() {
      const url = "https://disease.sh/v3/covid-19/all";
      await fetch(url)
      .then(response => response.json())
      .then(data => setCountryInfo(data));
    }
    fetchWorldWideData();
  },[])

  // ------------------------Pulling Data for particular country
  useEffect(() => {
    async function getCountriesData() {
      let url = "https://disease.sh/v3/covid-19/countries";
      await fetch(url)
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map(country => ({
            id: country.countryInfo._id,
            name: country.country,
            countryCode: country.countryInfo.iso2
          }));
          const sortedData = sortData(data);
          setTableData(sortedData);
          setCountries(countries);
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

          <InfoBox title="CoronaVirus Cases" cases={countryInfo.todayCases} total={countryInfo.cases} />
          <InfoBox title="Recovered" cases={countryInfo.todayRecovered} total={countryInfo.recovered} />
          <InfoBox title="Deaths" cases={countryInfo.todayDeaths} total={countryInfo.deaths} />

        </div>
        <Map />
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Live Cases By Country</h3>
          <Table countries={tableData}/>
          <h3>Worldwide New Cases</h3>
          <LineGraph/ >
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
