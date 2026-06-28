import React, { useState, useEffect } from 'react';
import {
  Dices,
  MapPin,
  Sparkles,
  Flame,
  Coffee,
  Beer,
  Utensils,
  Heart,
  Plus,
  Minus,
  Home,
  Trophy,
  Navigation
} from 'lucide-react';

// Importiere die aktualisierte JSON-Datei
import placesData from './data/places.json';

function App() {
  const [allPlaces] = useState(placesData);
  const [filteredPlaces, setFilteredPlaces] = useState(placesData);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  // Favoriten aus dem Speicher laden
  const [favorites, setFavorites] = useState(() => {
    const savedFavs = localStorage.getItem('pilsenFavorites');
    if (savedFavs) return JSON.parse(savedFavs);
    return placesData.filter((p) => p.isFavorite).map((p) => p.id);
  });

  // Crew-Bier-Tracker im Speicher
  const [crewBeers, setCrewBeers] = useState(() => {
    const savedCrew = localStorage.getItem('pilsenCrewBeers');
    return savedCrew
      ? JSON.parse(savedCrew)
      : { niklas: 0, kevin: 0, basti: 0 };
  });

  useEffect(() => {
    localStorage.setItem('pilsenFavorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('pilsenCrewBeers', JSON.stringify(crewBeers));
  }, [crewBeers]);

  // Filter-Logik inkl. der neuen TOP 7 Rangliste
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredPlaces(allPlaces);
    } else if (activeFilter === 'ranking') {
      // Hardcoded Reihenfolge für die Top 7
      const top7Ids = ['gourmet_01', 'cz_01', 'vip_01', 'cz_02', 'burger_02', 'cz_13', 'cz_17'];
      const rankedPlaces = top7Ids.map(id => allPlaces.find(p => p.id === id)).filter(Boolean);
      setFilteredPlaces(rankedPlaces);
    } else if (activeFilter === 'favorites') {
      setFilteredPlaces(allPlaces.filter((p) => favorites.includes(p.id)));
    } else if (activeFilter === 'beer_tracker') {
      setFilteredPlaces([]);
    } else {
      setFilteredPlaces(allPlaces.filter((p) => p.category === activeFilter));
    }
  }, [activeFilter, allPlaces, favorites]);

  const toggleFavorite = (e, placeId) => {
    e.stopPropagation();
    setFavorites((prevFavs) =>
      prevFavs.includes(placeId)
        ? prevFavs.filter((id) => id !== placeId)
        : [...prevFavs, placeId]
    );
  };

  const rollTheDice = () => {
    const rollablePlaces = filteredPlaces.filter(
      (p) => p.id !== 'hotel_central'
    );
    if (rollablePlaces.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * rollablePlaces.length);
    const randomSpot = rollablePlaces[randomIndex];
    setSelectedPlace(randomSpot);

    // Scrollt elegant zu dem zufällig ausgewählten Ort
    setTimeout(() => {
      const element = document.getElementById(`place-${randomSpot.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const updateBeer = (person, amount) => {
    setCrewBeers((prev) => ({
      ...prev,
      [person]: Math.max(0, prev[person] + amount),
    }));
  };

  // Google Maps Direkt-Link über den echten Namen!
  const openGoogleMaps = (placeName, e) => {
    if (e) e.stopPropagation();
    const query = encodeURIComponent(`${placeName}, Pilsen`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const getIcon = (category) => {
    switch (category) {
      case 'deftig':
        return <Utensils size={20} style={{ color: '#f59e0b' }} />;
      case 'bar':
        return <Beer size={20} style={{ color: '#3b82f6' }} />;
      case 'cafe':
        return <Coffee size={20} style={{ color: '#ec4899' }} />;
      case 'hotel':
        return <Home size={20} style={{ color: '#ef4444' }} />;
      case 'burger':
        return <Flame size={20} style={{ color: '#ef4444' }} />;
      case 'mexican':
        return <Flame size={20} style={{ color: '#10b981' }} />;
      default:
        return <Sparkles size={20} style={{ color: '#0ea5e9' }} />;
    }
  };

  return (
    <div
      style={{
        paddingBottom: '90px',
        minHeight: '100vh',
        backgroundColor: '#090b0e', 
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '24px 20px 16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(to bottom, rgba(9,11,14,1), rgba(9,11,14,0.85))',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: '900',
              letterSpacing: '-0.5px',
              background: 'linear-gradient(45deg, #ffffff, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Pilsen Hub 26
          </h1>
          <p
            style={{
              margin: '4px 0 0 0',
              color: '#94a3b8',
              fontSize: '13px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            DEFTIG • URIG • ECHT
          </p>
        </div>
      </header>

      {/* Horizontale Filter-Pills */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          padding: '16px 20px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {[
          { id: 'all', label: 'Alle Orte' },
          { id: 'ranking', label: 'Top 7 🏆' },
          { id: 'favorites', label: 'Favoriten ❤️' },
          { id: 'beer_tracker', label: 'Crew Deckel 🍻' },
          { id: 'deftig', label: 'Deftig 🍖' },
          { id: 'burger', label: 'Burger 🍔' },
          { id: 'bar', label: 'Kneipen 🥃' },
          { id: 'cafe', label: 'Cafés ☕' },
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => {
              setActiveFilter(filter.id);
              setSelectedPlace(null);
            }}
            style={{
              padding: '10px 20px',
              borderRadius: '99px',
              border: activeFilter === filter.id ? '1px solid #0ea5e9' : '1px solid rgba(255,255,255,0.1)',
              backgroundColor: activeFilter === filter.id ? 'rgba(14, 165, 233, 0.15)' : 'rgba(255,255,255,0.03)',
              color: activeFilter === filter.id ? '#fff' : '#94a3b8',
              fontSize: '14px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeFilter === filter.id ? '0 0 15px rgba(14, 165, 233, 0.3)' : 'none',
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {activeFilter !== 'beer_tracker' ? (
        <main style={{ padding: '10px 20px' }}>
          
          {/* Der "Feed" der Orte */}
          <div style={{ display: 'grid', gap: '20px' }}>
            {filteredPlaces.map((place, index) => {
              const isSelected = selectedPlace && selectedPlace.id === place.id;
              const isFav = favorites.includes(place.id);
              const isHotel = place.id === 'hotel_central';

              return (
                <div
                  id={`place-${place.id}`}
                  key={place.id}
                  onClick={() => setSelectedPlace(place)}
                  style={{
                    position: 'relative',
                    backgroundColor: isHotel ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.03)',
                    border: isSelected 
                        ? '1px solid #0ea5e9' 
                        : isHotel 
                        ? '1px solid rgba(239, 68, 68, 0.3)' 
                        : '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '24px',
                    padding: '20px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isSelected ? '0 10px 30px rgba(0,0,0,0.5), 0 0 0 1px #0ea5e9' : '0 4px 20px rgba(0,0,0,0.2)',
                  }}
                >
                  {/* Ranking Badge (Wird nur angezeigt, wenn "Top 7" Filter aktiv ist) */}
                  {activeFilter === 'ranking' && (
                    <div style={{ 
                      display: 'inline-block',
                      background: index === 0 ? 'linear-gradient(135deg, #fbbf24, #d97706)' : 
                                  index === 1 ? 'linear-gradient(135deg, #cbd5e1, #64748b)' : 
                                  index === 2 ? 'linear-gradient(135deg, #f87171, #b91c1c)' : 
                                  'rgba(255,255,255,0.1)',
                      color: '#fff',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      fontWeight: '800',
                      fontSize: '13px',
                      marginBottom: '16px',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                      {index === 0 ? '🥇 Platz 1' : index === 1 ? '🥈 Platz 2' : index === 2 ? '🥉 Platz 3' : `🎖️ Platz ${index + 1}`}
                    </div>
                  )}

                  {/* Favoriten Herz */}
                  {!isHotel && activeFilter !== 'ranking' && (
                    <button
                      onClick={(e) => toggleFavorite(e, place.id)}
                      style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2
                      }}
                    >
                      <Heart
                        size={20}
                        fill={isFav ? '#ef4444' : 'transparent'}
                        color={isFav ? '#ef4444' : '#64748b'}
                      />
                    </button>
                  )}

                  {/* Header Bereich der Karte */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', paddingRight: activeFilter !== 'ranking' ? '40px' : '0' }}>
                    <div style={{ 
                        padding: '10px', 
                        backgroundColor: 'rgba(0,0,0,0.3)', 
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        {getIcon(place.category)}
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: isHotel ? '#ef4444' : '#fff' }}>
                        {place.name}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                            <MapPin size={14} style={{ color: isHotel ? '#ef4444' : '#0ea5e9' }} />
                            <span style={{ color: isHotel ? '#ef4444' : '#0ea5e9', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {place.type}
                            </span>
                        </div>
                    </div>
                  </div>

                  {/* Tags (Mittagstisch, Geheimtipp etc.) */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    {place.lunch_deal && (
                      <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Flame size={12} /> Mittagstisch
                      </span>
                    )}
                    {place.secret_tip && (
                      <span style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', border: '1px solid rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Sparkles size={12} /> Geheimtipp
                      </span>
                    )}
                    {place.wm_spot && (
                      <span style={{ backgroundColor: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', border: '1px solid rgba(14, 165, 233, 0.2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        ⚽ WM-Kneipe
                      </span>
                    )}
                  </div>

                  <p style={{ margin: '0', color: '#cbd5e1', fontSize: '15px', lineHeight: '1.6', fontWeight: '400' }}>
                    {place.description}
                  </p>

                  {/* Premium Speisekarten-Ansicht (Jetzt mit vollem Preis in EUR & CZK) */}
                  {place.prices && place.prices.length > 0 && (
                    <div style={{ marginTop: '20px', padding: '16px', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 12px 0', fontSize: '13px', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px' }}>
                        <Utensils size={14} style={{ color: '#10b981' }} /> Top Empfehlungen
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {place.prices.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx !== place.prices.length - 1 ? '1px dashed rgba(255,255,255,0.1)' : 'none', paddingBottom: idx !== place.prices.length - 1 ? '8px' : '0' }}>
                            <span style={{ color: '#f8fafc', fontSize: '14px', fontWeight: '500' }}>
                              {item.item}
                            </span>
                            {/* FIX: Hier wird jetzt der gesamte String (CZK + EUR) angezeigt */}
                            <span style={{ color: '#10b981', fontWeight: '700', fontSize: '14px', marginLeft: '12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                              {item.cost}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Der Google Maps Button */}
                  <button
                    onClick={(e) => openGoogleMaps(place.name, e)}
                    style={{
                      marginTop: '20px',
                      width: '100%',
                      padding: '16px',
                      backgroundColor: '#4285F4',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '14px',
                      fontSize: '16px',
                      fontWeight: '700',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(66, 133, 244, 0.4)',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseDown={(e) => e.currentTarget.style.backgroundColor = '#3367d6'}
                    onMouseUp={(e) => e.currentTarget.style.backgroundColor = '#4285F4'}
                  >
                    <Navigation size={20} />
                    In Google Maps öffnen
                  </button>
                </div>
              );
            })}
          </div>
        </main>
      ) : (
        /* Bierdeckel Tracker */
        <main style={{ padding: '16px 20px' }}>
          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
                <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '0 0 8px 0', background: 'linear-gradient(45deg, #f59e0b, #d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                🍻 Crew-Wertung
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0', lineHeight: '1.5' }}>
                Hier wird abgerechnet. Jeder trackt seine eigenen Runden.
                </p>
            </div>

            {[
              { id: 'niklas', name: 'Niklas' },
              { id: 'kevin', name: 'Kevin' },
              { id: 'basti', name: 'Basti' },
            ].map((user) => (
              <div
                key={user.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '24px',
                  padding: '20px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px', fontWeight: '900', color: '#f59e0b' }}>
                    {user.name[0]}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#fff' }}>{user.name}</h4>
                    <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>Pilsner Urquell</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button onClick={() => updateBeer(user.id, -1)} style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
                    <Minus size={18} />
                  </button>
                  <span style={{ fontSize: '28px', fontWeight: '900', color: '#f59e0b', minWidth: '36px', textAlign: 'center', textShadow: '0 0 15px rgba(245, 158, 11, 0.3)' }}>
                    {crewBeers[user.id]}
                  </span>
                  <button onClick={() => updateBeer(user.id, 1)} style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f59e0b', border: 'none', color: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', fontWeight: 'bold' }}>
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* Floating Action Button (Zufalls-Würfel) */}
      {activeFilter !== 'beer_tracker' && (
        <button
          onClick={rollTheDice}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '20px',
            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '64px',
            height: '64px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 8px 30px rgba(14, 165, 233, 0.4), inset 0 2px 4px rgba(255,255,255,0.2)',
            cursor: 'pointer',
            zIndex: 1000,
            transition: 'transform 0.1s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Dices size={32} />
        </button>
      )}
    </div>
  );
}

export default App;