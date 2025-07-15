import React, { useState } from 'react';
import { useFlightSearch } from '../hooks/useFlightSearch';
import { Card, Form, Input, DatePicker, Select, Radio, InputNumber } from 'antd';
import { Search, MapPin, Calendar, Users, ArrowLeftRight } from 'lucide-react';
import dayjs from 'dayjs';
import { CITIES, FLIGHT_CLASSES } from '../../../shared/constants';
import { Button } from '../../../shared/components/ui/Button';
import { FlightSearchFormData } from '../types';

const { Option } = Select;
const { RangePicker } = DatePicker;

// Hàm giúp tìm kiếm tiếng Việt không dấu
const normalizeVietnamese = (str: string): string => {
  return str.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

interface FlightSearchFormProps {
  onSearch: (searchData: FlightSearchFormData) => void;
  loading?: boolean;
}

export const FlightSearchForm: React.FC<FlightSearchFormProps> = ({
  onSearch,
  loading: loadingProp = false
}) => {
  const [form] = Form.useForm();
  const [tripType, setTripType] = useState('roundtrip');
  const { searchFlights, loading } = useFlightSearch();

  const handleSearch = (values: any) => {
    // Format date theo định dạng DD-MM-YYYY HH:mm
    const formatDate = (date: any) => {
      if (!date) return null;
      return dayjs(date).format('DD-MM-YYYY HH:mm');
    };

    // Chuẩn hóa dữ liệu gửi về API
    const apiData = {
      departure_airport: values.from,
      arrival_airport: values.to,
      departure_date: tripType === 'roundtrip' && values.dates 
        ? formatDate(values.dates[0]) 
        : formatDate(values.departureDate),
      return_date: tripType === 'roundtrip' && values.dates 
        ? formatDate(values.dates[1]) 
        : formatDate(values.returnDate),
      flight_class: values.class,
      passengers: values.passengers,
    };
    
    console.log('API Request Data:', apiData);
    searchFlights(apiData);
    if (onSearch) onSearch({ ...values, tripType });
  };

  const swapCities = () => {
    const from = form.getFieldValue('from');
    const to = form.getFieldValue('to');
    form.setFieldsValue({
      from: to,
      to: from,
    });
  };

  return (
    <Card className="bg-slate-800/90 backdrop-blur-md border-slate-700 shadow-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">Tìm Kiếm Chuyến Bay</h2>
        <Radio.Group
          value={tripType}
          onChange={(e) => setTripType(e.target.value)}
          className="mb-6"
        >
          <Radio.Button value="roundtrip" className="mr-2">Khứ hồi</Radio.Button>
          <Radio.Button value="oneway" className="mr-2">Một chiều</Radio.Button>
          <Radio.Button value="multicity">Nhiều thành phố</Radio.Button>
        </Radio.Group>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSearch}
        initialValues={{
          passengers: 1,
          class: 'economy',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Form.Item
            name="from"
            label={<span className="text-slate-300">Điểm đi</span>}
            rules={[{ required: true, message: 'Vui lòng chọn thành phố khởi hành' }]}
          >
            <Select
              showSearch
              placeholder="Thành phố khởi hành"
              size="large"
              suffixIcon={<MapPin size={16} />}
              filterOption={(input, option) => {
                const optionValue = option?.children?.toString() || '';
                const inputLower = normalizeVietnamese(input.toLowerCase());
                const optionLower = normalizeVietnamese(optionValue);
                return optionLower.includes(inputLower);
              }}
            >
              {CITIES.map(city => (
                <Option key={city.code} value={city.code}>
                  <div className="flex justify-between">
                    <span>{city.name}</span>
                    <span className="text-slate-400">{city.code}</span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div className="relative">
            <Form.Item
              name="to"
              label={<span className="text-slate-300">Điểm đến</span>}
              rules={[{ required: true, message: 'Vui lòng chọn thành phố đến' }]}
            >
              <Select
                showSearch
                placeholder="Thành phố đến"
                size="large"
                suffixIcon={<MapPin size={16} />}
                filterOption={(input, option) => {
                  const optionValue = option?.children?.toString() || '';
                  const inputLower = normalizeVietnamese(input.toLowerCase());
                  const optionLower = normalizeVietnamese(optionValue);
                  return optionLower.includes(inputLower);
                }}
              >
                {CITIES.map(city => (
                  <Option key={city.code} value={city.code}>
                    <div className="flex justify-between">
                      <span>{city.name}</span>
                      <span className="text-slate-400">{city.code}</span>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Button
              variant="ghost"
              className="absolute top-8 -right-2 z-10 bg-blue-600 hover:bg-blue-700 text-white border-none rounded-full w-8 h-8 flex items-center justify-center p-0"
              onClick={swapCities}
            >
              <ArrowLeftRight size={16} />
            </Button>
          </div>

          {tripType === 'roundtrip' ? (
            <Form.Item
              name="dates"
              label={<span className="text-slate-300">Ngày đi - Ngày về</span>}
              rules={[{ required: true, message: 'Vui lòng chọn ngày đi và về' }]}
            >
              <RangePicker
                size="large"
                placeholder={['Ngày đi', 'Ngày về']}
                suffixIcon={<Calendar size={16} />}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
                className="w-full"
              />
            </Form.Item>
          ) : (
            <Form.Item
              name="departureDate"
              label={<span className="text-slate-300">Ngày đi</span>}
              rules={[{ required: true, message: 'Vui lòng chọn ngày đi' }]}
            >
              <DatePicker
                size="large"
                placeholder="Ngày đi"
                suffixIcon={<Calendar size={16} />}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
                className="w-full"
              />
            </Form.Item>
          )}

          <Form.Item
            name="passengers"
            label={<span className="text-slate-300">Hành khách</span>}
          >
            <InputNumber
              size="large"
              min={1}
              max={9}
              prefix={<Users size={16} />}
              className="w-full"
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Form.Item
            name="class"
            label={<span className="text-slate-300">Hạng ghế</span>}
          >
            <Select size="large" placeholder="Chọn hạng ghế">
              {FLIGHT_CLASSES.map(flightClass => (
                <Option key={flightClass.value} value={flightClass.value}>
                  {flightClass.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <div className="flex justify-center">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading || loadingProp}
            className="h-12 px-8 text-lg font-semibold"
          >
            <Search size={20} className="mr-2" />
            Tìm Chuyến Bay
          </Button>
        </div>
      </Form>
    </Card>
  );
};