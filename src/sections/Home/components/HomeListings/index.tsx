import React from "react";
import { List, Typography } from "antd";
import { ListingCard } from "../../../../lib/components";
import { Listings } from "../../../../lib/graphql/queries/Listings/__generated__/Listings";
import { Link } from "react-router-dom";

interface Props {
  title: string;
  listings: Listings["listings"]["result"];
}

const { Title } = Typography;

export const HomeListings = ({ title, listings }: Props) => {
  return (
    <div className="home-listings">
      <Title level={4} className="home-listings__title">
        {title}
      </Title>
      <List
        grid={{
          gutter: 8,
          xs: 1,
          sm: 2,
          lg: 4
        }}
        dataSource={listings}
        renderItem={listing => (
          <List.Item>
            <Link to={`/listing/${listing.id}`}>
            <ListingCard listing={listing} />
            </Link>
          </List.Item>
        )}
      />
    </div>
  )
};