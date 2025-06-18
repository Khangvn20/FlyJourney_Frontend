import React, { useState } from 'react';
import { Card, Button, Steps, Form, Input, Select, DatePicker, Divider } from 'antd';
import { ArrowLeft, User, CreditCard, CheckCircle, Plane } from 'lucide-react';
import type { Flight } from '../App';

const { Step } = Steps;
const { Option } = Select;

interface BookingFlowProps {
  flight: Flight;
  onBack: () => void;
}

const BookingFlow: React.FC<BookingFlowProps> = ({ flight, onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();

  const steps = [
    {
      title: 'Passenger Details',
      icon: <User size={20} />,
    },
    {
      title: 'Payment',
      icon: <CreditCard size={20} />,
    },
    {
      title: 'Confirmation',
      icon: <CheckCircle size={20} />,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = (values: any) => {
    console.log('Booking completed:', values);
    handleNext();
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button
            type="text"
            icon={<ArrowLeft size={20} />}
            onClick={onBack}
            className="text-slate-300 hover:text-white"
          >
            Back to Results
          </Button>
          <div className="text-white">
            <h1 className="text-2xl font-bold">Complete Your Booking</h1>
            <p className="text-slate-400">
              {flight.departure.city} → {flight.arrival.city} • {flight.airline} {flight.flightNumber}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/90 border-slate-700">
              <Steps current={currentStep} className="mb-8">
                {steps.map((step, index) => (
                  <Step
                    key={index}
                    title={step.title}
                    icon={step.icon}
                  />
                ))}
              </Steps>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
              >
                {/* Step 1: Passenger Details */}
                {currentStep === 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-6">Passenger Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <Form.Item
                        name="firstName"
                        label={<span className="text-slate-300">First Name</span>}
                        rules={[{ required: true, message: 'Please enter first name' }]}
                      >
                        <Input size="large" placeholder="First Name" />
                      </Form.Item>
                      
                      <Form.Item
                        name="lastName"
                        label={<span className="text-slate-300">Last Name</span>}
                        rules={[{ required: true, message: 'Please enter last name' }]}
                      >
                        <Input size="large" placeholder="Last Name" />
                      </Form.Item>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <Form.Item
                        name="email"
                        label={<span className="text-slate-300">Email</span>}
                        rules={[
                          { required: true, message: 'Please enter email' },
                          { type: 'email', message: 'Please enter valid email' }
                        ]}
                      >
                        <Input size="large" placeholder="Email Address" />
                      </Form.Item>
                      
                      <Form.Item
                        name="phone"
                        label={<span className="text-slate-300">Phone Number</span>}
                        rules={[{ required: true, message: 'Please enter phone number' }]}
                      >
                        <Input size="large" placeholder="Phone Number" />
                      </Form.Item>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <Form.Item
                        name="dateOfBirth"
                        label={<span className="text-slate-300">Date of Birth</span>}
                        rules={[{ required: true, message: 'Please select date of birth' }]}
                      >
                        <DatePicker size="large" placeholder="Date of Birth" className="w-full" />
                      </Form.Item>
                      
                      <Form.Item
                        name="gender"
                        label={<span className="text-slate-300">Gender</span>}
                        rules={[{ required: true, message: 'Please select gender' }]}
                      >
                        <Select size="large" placeholder="Select Gender">
                          <Option value="male">Male</Option>
                          <Option value="female">Female</Option>
                          <Option value="other">Other</Option>
                        </Select>
                      </Form.Item>
                    </div>

                    <h4 className="text-lg font-medium text-white mb-4">Passport Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <Form.Item
                        name="passportNumber"
                        label={<span className="text-slate-300">Passport Number</span>}
                        rules={[{ required: true, message: 'Please enter passport number' }]}
                      >
                        <Input size="large" placeholder="Passport Number" />
                      </Form.Item>
                      
                      <Form.Item
                        name="nationality"
                        label={<span className="text-slate-300">Nationality</span>}
                        rules={[{ required: true, message: 'Please select nationality' }]}
                      >
                        <Select size="large" placeholder="Select Nationality" showSearch>
                          <Option value="us">United States</Option>
                          <Option value="uk">United Kingdom</Option>
                          <Option value="ca">Canada</Option>
                          <Option value="au">Australia</Option>
                        </Select>
                      </Form.Item>
                    </div>
                  </div>
                )}

                {/* Step 2: Payment */}
                {currentStep === 1 && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-6">Payment Information</h3>
                    
                    <div className="mb-6">
                      <Form.Item
                        name="cardNumber"
                        label={<span className="text-slate-300">Card Number</span>}
                        rules={[{ required: true, message: 'Please enter card number' }]}
                      >
                        <Input size="large" placeholder="1234 5678 9012 3456" />
                      </Form.Item>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Form.Item
                        name="expiryMonth"
                        label={<span className="text-slate-300">Expiry Month</span>}
                        rules={[{ required: true, message: 'Please select month' }]}
                      >
                        <Select size="large" placeholder="MM">
                          {Array.from({ length: 12 }, (_, i) => (
                            <Option key={i + 1} value={i + 1}>
                              {String(i + 1).padStart(2, '0')}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                      
                      <Form.Item
                        name="expiryYear"
                        label={<span className="text-slate-300">Expiry Year</span>}
                        rules={[{ required: true, message: 'Please select year' }]}
                      >
                        <Select size="large" placeholder="YYYY">
                          {Array.from({ length: 10 }, (_, i) => (
                            <Option key={2024 + i} value={2024 + i}>
                              {2024 + i}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                      
                      <Form.Item
                        name="cvv"
                        label={<span className="text-slate-300">CVV</span>}
                        rules={[{ required: true, message: 'Please enter CVV' }]}
                      >
                        <Input size="large" placeholder="123" />
                      </Form.Item>
                    </div>

                    <Form.Item
                      name="cardholderName"
                      label={<span className="text-slate-300">Cardholder Name</span>}
                      rules={[{ required: true, message: 'Please enter cardholder name' }]}
                    >
                      <Input size="large" placeholder="Name on Card" />
                    </Form.Item>

                    <h4 className="text-lg font-medium text-white mb-4">Billing Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <Form.Item
                        name="address"
                        label={<span className="text-slate-300">Address</span>}
                        rules={[{ required: true, message: 'Please enter address' }]}
                      >
                        <Input size="large" placeholder="Street Address" />
                      </Form.Item>
                      
                      <Form.Item
                        name="city"
                        label={<span className="text-slate-300">City</span>}
                        rules={[{ required: true, message: 'Please enter city' }]}
                      >
                        <Input size="large" placeholder="City" />
                      </Form.Item>
                    </div>
                  </div>
                )}

                {/* Step 3: Confirmation */}
                {currentStep === 2 && (
                  <div className="text-center">
                    <div className="bg-green-600/20 p-8 rounded-lg mb-6">
                      <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h3>
                      <p className="text-slate-300">
                        Your flight has been successfully booked. You will receive a confirmation email shortly.
                      </p>
                    </div>
                    
                    <div className="bg-slate-700/50 p-6 rounded-lg text-left">
                      <h4 className="text-lg font-semibold text-white mb-4">Booking Details</h4>
                      <div className="space-y-2 text-slate-300">
                        <p><strong>Booking Reference:</strong> SKY{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
                        <p><strong>Flight:</strong> {flight.airline} {flight.flightNumber}</p>
                        <p><strong>Route:</strong> {flight.departure.city} → {flight.arrival.city}</p>
                        <p><strong>Date:</strong> {flight.departure.date}</p>
                        <p><strong>Time:</strong> {flight.departure.time} - {flight.arrival.time}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  {currentStep > 0 && currentStep < 2 && (
                    <Button size="large\" onClick={handlePrev}>
                      Previous
                    </Button>
                  )}
                  
                  {currentStep < 2 && (
                    <Button
                      type="primary"
                      size="large"
                      onClick={currentStep === 1 ? () => form.submit() : handleNext}
                      className="bg-blue-600 hover:bg-blue-700 border-blue-600 ml-auto"
                    >
                      {currentStep === 1 ? 'Complete Booking' : 'Next'}
                    </Button>
                  )}
                </div>
              </Form>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/90 border-slate-700 sticky top-24">
              <h3 className="text-lg font-semibold text-white mb-4">Booking Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Plane className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white">{flight.airline}</div>
                    <div className="text-sm text-slate-400">{flight.flightNumber}</div>
                  </div>
                </div>

                <div className="text-sm text-slate-300">
                  <div className="flex justify-between mb-2">
                    <span>Departure:</span>
                    <span>{flight.departure.city} ({flight.departure.code})</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Arrival:</span>
                    <span>{flight.arrival.city} ({flight.arrival.code})</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Duration:</span>
                    <span>{flight.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stops:</span>
                    <span>{flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}</span>
                  </div>
                </div>
              </div>

              <Divider className="bg-slate-600" />

              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span>Base Fare:</span>
                  <span>${flight.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & Fees:</span>
                  <span>${Math.round(flight.price * 0.15)}</span>
                </div>
                <Divider className="bg-slate-600" />
                <div className="flex justify-between text-lg font-semibold text-white">
                  <span>Total:</span>
                  <span>${Math.round(flight.price * 1.15)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;