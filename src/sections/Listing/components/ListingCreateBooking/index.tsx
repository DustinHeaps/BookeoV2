import React, { Component } from 'react';
import { Button, Card, Divider, Typography, DatePicker, Tooltip } from 'antd';
import moment, { Moment } from 'moment';
import { Listing as ListingData } from '../../../../lib/graphql/queries/Listing/__generated__/Listing';
import { formatListingPrice, displayErrorMessage } from '../../../../lib/utils';
import { Viewer } from '../../../../lib/types';
import { BookingsIndex } from './types';

const { Paragraph, Title, Text } = Typography;

interface Props {
  price: number;
  viewer: Viewer;
  host: ListingData['listing']['host'];
  bookingsIndex: ListingData['listing']['bookingsIndex'];
  checkInDate: Moment | null;
  checkOutDate: Moment | null;
  setModalVisible: (modalVisible: boolean) => void;
  setCheckInDate: (checkInDate: Moment | null) => void;
  setCheckOutDate: (checkOutDate: Moment | null) => void;
}

export const ListingCreateBooking = ({
  viewer,
  host,
  price,
  bookingsIndex,
  checkInDate,
  checkOutDate,
  setCheckInDate,
  setCheckOutDate,
  setModalVisible
}: Props) => {
  const bookingsIndexJSON: BookingsIndex = JSON.parse(bookingsIndex);
  const dateIsBooked = (currentDate: Moment) => {
    const year = moment(currentDate).year();
    const month = moment(currentDate).month();
    const day = moment(currentDate).date();

    if (bookingsIndexJSON[year] && bookingsIndexJSON[year][month]) {
      return Boolean(bookingsIndexJSON[year][month][day]);
    } else {
      return false;
    }
  };

  const disableDate = (currentDate?: Moment) => {
    if (currentDate) {
      const dateIsBeforeEndOfDay = currentDate.isBefore(moment().endOf('day'));
      const dateIsMoreThanThreeMonthsAhead = moment(currentDate).isAfter(
        moment()
          .endOf('day')
          .add(90, 'days')
      );

      return dateIsBeforeEndOfDay || dateIsMoreThanThreeMonthsAhead || dateIsBooked(currentDate);
    } else {
      return false;
    }
  };

  const verifyAndSetCheckOutDate = (selectedCheckOutDate: Moment | null) => {
    if (checkInDate && selectedCheckOutDate) {
      if (moment(selectedCheckOutDate).isBefore(checkInDate, 'days')) {
        return displayErrorMessage(`You can't book date of check out that is before check in date!`);
      }
    }
    // let dateCursor = checkInDate;

    while (moment(checkInDate).isBefore(selectedCheckOutDate, 'days')) {
      checkInDate = moment(checkInDate).add(1, 'days');

      const year = moment(checkInDate).year();
      const month = moment(checkInDate).month();
      const day = moment(checkInDate).date();

      if (bookingsIndexJSON[year] && bookingsIndexJSON[year][month] && bookingsIndexJSON[year][month][day]) {
        return displayErrorMessage(
          "You can't book a period of time that overlaps existing bookings. Please try again!"
        );
      }
    }
    setCheckOutDate(selectedCheckOutDate);
  };

  const viewerIsHost = viewer.id === host.id;
  const checkInInputDisabled = !viewer.id || viewerIsHost;
  const checkOutInputDisabled = !checkInDate;
  const buttonInputDisabled = !checkInDate || !checkOutDate;

  let buttonMessage = "You won't be charged yet";
  if (!viewer.id) {
    buttonMessage = 'You have to be signed in to `book a listing!';
  } else if (viewerIsHost) {
    buttonMessage = "You can't book your own listing!";
  } else if (!host.hasWallet) {
    buttonMessage = "The host has disconnected from Stripe and thus won't be able to receive payments!";
  }

  return (
    <div className='listing-booking'>
      <Card className='listing-booking__card'>
        <div>
          <Paragraph>
            <Title level={2} className='listing-booking__card-title'>
              ${formatListingPrice(price)}
              <span>/day</span>
            </Title>
          </Paragraph>
          <Divider />
          <div className='listing-booking__card-date-picker'>
            <Paragraph strong>Check In</Paragraph>
            <DatePicker
              value={checkInDate ? checkInDate : null}
              disabledDate={disableDate}
              onChange={dateValue => setCheckInDate(dateValue)}
              showToday={false}
              onOpenChange={() => setCheckOutDate(null)}
              renderExtraFooter={() => {
                return (
                  <div>
                    <Text type="secondary" className="ant-calendar-footer-text">
                      You can only book a listing within 90 days from today.
                    </Text>
                  </div>
                );
              }}
            />
          </div>
          <div className='listing-booking__card-date-picker'>
            <Paragraph strong>Check Out</Paragraph>
            <DatePicker
              value={checkOutDate ? checkOutDate : null}
              disabledDate={disableDate}
              onChange={dateValue => verifyAndSetCheckOutDate(dateValue)}
              showToday={false}
              disabled={checkOutInputDisabled}
              dateRender={current => {
                if (
                  moment(current).isSame(checkInDate ? checkInDate : undefined, "day")
                ) {
                  return (
                    <Tooltip title="Check in date">
                      <div className="ant-calendar-date ant-calendar-date__check-in">
                        {current.date()}
                      </div>
                    </Tooltip>
                  );
                } else {
                  return <div className="ant-calendar-date">{current.date()}</div>;
                }
              }}
              renderExtraFooter={() => {
                return (
                  <div>
                    <Text type="secondary" className="ant-calendar-footer-text">
                      Check-out cannot be before check-in.
                    </Text>
                  </div>
                );
              }}
            />
          </div>
        </div>
        <Divider />

        <Button
          disabled={buttonInputDisabled}
          size='large'
          type='primary'
          className='listing-booking__card-cta'
          onClick={() => setModalVisible(true)}
        >
          Request to book!
        </Button>
        <Text type='secondary' mark>
          {buttonMessage}
        </Text>
      </Card>
    </div>
  );
};
