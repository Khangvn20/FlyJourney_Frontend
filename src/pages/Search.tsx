import React from 'react';
import { Divider } from 'antd';
import FlightSearchForm from '../components/FlightSearchForm';
import FlightResultCard from '../components/FlightResultCard';

const Search: React.FC = () => {
  return (
    <div>
      <FlightSearchForm />
      <Divider />
      <FlightResultCard />
      <FlightResultCard />
      <FlightResultCard />
    </div>
  );
};

export default Search;
