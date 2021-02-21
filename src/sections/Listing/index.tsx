import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useQuery } from '@apollo/react-hooks';
import { useParams } from "react-router-dom";
import { Col, Layout, Row } from 'antd';
import { Moment } from 'moment';
import { PageSkeleton, ErrorBanner } from '../../lib/components';
import { Viewer } from '../../lib/types';
import { LISTING } from '../../lib/graphql/queries';
import { Listing as ListingData, ListingVariables } from '../../lib/graphql/queries/Listing/__generated__/Listing';
import { ListingDetails, ListingBookings, ListingCreateBooking, CreateBookingModal } from './components';
import { useScrollToTop } from '../../lib/hooks';

interface MatchParams {
  id: string;
}

interface Props {
  viewer: Viewer;
}

const { Content } = Layout;
const PAGE_LIMIT = 3;



export const Listing = ({ viewer }: Props) => {
  const [bookingsPage, setBookingsPage] = useState(1);
  const [checkInDate, setCheckInDate] = useState<Moment | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Moment | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { id } = useParams<MatchParams>();

  const { loading, data, error, refetch } = useQuery<ListingData, ListingVariables>(LISTING, {

    variables: {
      id,
      bookingsPage,
      limit: PAGE_LIMIT
    }
  });

  useScrollToTop();

  if (loading) {
    return (
      <Content className='listings'>
        <PageSkeleton />
      </Content>
    );
  }

  if (error) {
    return (
      <Content className='listing'>
        <ErrorBanner description="This listing may not exist or we've encountered an error. Please try again soon." />
        <PageSkeleton />
      </Content>
    );
  }

  const clearBookingData = () => {
    setModalVisible(false);
    setCheckInDate(null);
    setCheckOutDate(null);
  };

  const handleListingRefetch = async () => {
    await refetch();
  };

  const listing = data ? data.listing : null;
  const listingBookings = listing ? listing.bookings : null;
  const listingDetailsElement = listing ? <ListingDetails listing={listing} /> : null;
  const listingBookingsElement = listingBookings ? (
    <ListingBookings
      listingBookings={listingBookings}
      bookingsPage={bookingsPage}
      limit={PAGE_LIMIT}
      setBookingsPage={setBookingsPage}
    />
  ) : null;

  const ListingCreateBookingElement = listing ? (
    <ListingCreateBooking
      viewer={viewer}
      host={listing.host}
      price={listing.price}
      bookingsIndex={listing.bookingsIndex}
      checkInDate={checkInDate}
      checkOutDate={checkOutDate}
      setCheckInDate={setCheckInDate}
      setCheckOutDate={setCheckOutDate}
      setModalVisible={setModalVisible}
    />
  ) : null;

  const CreateBookingModalElement =
    listing && checkInDate && checkOutDate ? (
      <CreateBookingModal
        id={listing.id}
        price={listing.price}
        modalVisible={modalVisible}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        setModalVisible={setModalVisible}
        clearBookingData={clearBookingData}
        handleListingRefetch={handleListingRefetch}
      />
    ) : null;

  return (
    <Content className='listings'>
      <Row gutter={24} justify='space-between'>
        <Col xs={24} lg={14}>
          {listingDetailsElement}
          {listingBookingsElement}
        </Col>
        <Col xs={24} lg={10}>
          {ListingCreateBookingElement}
        </Col>
      </Row>
      {CreateBookingModalElement}
    </Content>
  );
};