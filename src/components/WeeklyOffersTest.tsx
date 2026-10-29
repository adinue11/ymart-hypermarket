
import { useEffect, useState } from 'react';
import { getWeeklyOfferPosters } from '../lib/ymart-offers';

export default function WeeklyOffersTest() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWeeklyOfferPosters()
      .then(setOffers)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading offers...</p>;

  return (
    <div>
      <h2>Weekly Offers</h2>

      {offers.length === 0 ? (
        <p>No active offers found.</p>
      ) : (
        offers.map((offer) => (
          <div key={offer.id}>
            <p>{offer.title}</p>
            <p>{offer.outlet}</p>
          </div>
        ))
      )}
    </div>
  );
}
