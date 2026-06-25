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
  Banknote,
  Plus,
  Minus,
  Home,
  Trophy,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import placesData from './data/places.json';

// Icon-Fix für Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const redIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapAnimator({ coordinates }) {
  const map = useMap();
  useEffect(() => {
    if (coordinates) {
      map.flyTo(coordinates, 16, { animate: true, duration: 1.2 });
    }
  }, [coordinates, map]);
  return null;
}

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

  // NEU: Getrennter Crew-Bier-Tracker im Speicher
  const [crewBeers, setCrewBeers] = useState(() => {
    const savedCrew = localStorage.getItem('pilsenCrewBeers');
    return savedCrew
      ? JSON.parse(savedCrew)
      : { niklas: 0, kevin: 0, basti: 0 };
  });

  const pilsenCenter = [49.7475, 13.3776];

  useEffect(() => {
    localStorage.setItem('pilsenFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Synchronisiert die Crew-Stände im Speicher
  useEffect(() => {
    localStorage.setItem('pilsenCrewBeers', JSON.stringify(crewBeers));
  }, [crewBeers]);

  // Filter-Logik
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredPlaces(allPlaces);
    } else if (activeFilter === 'favorites') {
      setFilteredPlaces(allPlaces.filter((p) => favorites.includes(p.id)));
    } else if (activeFilter === 'beer_tracker') {
      setFilteredPlaces([]); // Keine Orte anzeigen, wenn wir im Tracker-Tab sind
    } else {
      setFilteredPlaces(allPlaces.filter((p) => p.category === activeFilter));
    }
    setSelectedPlace(null);
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
  };

  const updateBeer = (person, amount) => {
    setCrewBeers((prev) => ({
      ...prev,
      [person]: Math.max(0, prev[person] + amount),
    }));
  };

  const getIcon = (category) => {
    switch (category) {
      case 'deftig':
        return <Utensils size={18} style={{ color: '#f59e0b' }} />;
      case 'bar':
        return <Beer size={18} style={{ color: '#3b82f6' }} />;
      case 'cafe':
        return <Coffee size={18} style={{ color: '#ec4899' }} />;
      case 'hotel':
        return <Home size={18} style={{ color: '#ef4444' }} />;
      default:
        return <Sparkles size={18} style={{ color: 'var(--accent-neon)' }} />;
    }
  };

  return (
    <div
      style={{
        paddingBottom: '90px',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-main)',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '24px 20px 16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background:
            'linear-gradient(to bottom, rgba(9,11,14,1), rgba(9,11,14,0.8))',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '26px',
              fontWeight: '900',
              letterSpacing: '-0.5px',
              background: 'linear-gradient(45deg, #fff, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Pilsen Hub 26
          </h1>
          <p
            style={{
              margin: '4px 0 0 0',
              color: 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            DEFTIG • URIG • ECHT
          </p>
        </div>
      </header>

      {/* Horizontale Filter-Pills (Jetzt mit der Sparte Bierdeckel) */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          padding: '10px 16px 20px 16px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {[
          { id: 'all', label: 'Alle' },
          { id: 'favorites', label: 'Favoriten ❤️' },
          { id: 'beer_tracker', label: 'Bierdeckel 🍻' }, // Eigene Sparte
          { id: 'deftig', label: 'Deftig 🍖' },
          { id: 'bar', label: 'Kneipen & Bars 🥃' },
          { id: 'cafe', label: 'Cafés 26 ☕' },
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            style={{
              padding: '10px 18px',
              borderRadius: '99px',
              border:
                activeFilter === filter.id
                  ? '1px solid var(--accent-neon)'
                  : '1px solid var(--border-subtle)',
              backgroundColor:
                activeFilter === filter.id
                  ? 'rgba(14, 165, 233, 0.15)'
                  : 'var(--bg-card)',
              color:
                activeFilter === filter.id
                  ? 'var(--text-main)'
                  : 'var(--text-muted)',
              fontSize: '14px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow:
                activeFilter === filter.id
                  ? '0 0 15px var(--accent-glow)'
                  : 'none',
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* BEDINGTE RENDERING: Zeige Karte und Liste NUR, wenn NICHT die Sparte Bierdeckel aktiv ist */}
      {activeFilter !== 'beer_tracker' ? (
        <>
          {/* WM Live Info Box (Nur in der normalen Ansicht) */}
          <div style={{ padding: '0 16px 16px 16px' }}>
            <div
              style={{
                backgroundColor: 'rgba(14, 165, 233, 0.03)',
                border: '1px solid rgba(14, 165, 233, 0.15)',
                borderRadius: '20px',
                padding: '14px 16px',
                display: 'flex',
                gap: '12px',
                alignItems: 'start',
              }}
            >
              <Trophy
                size={18}
                style={{
                  color: 'var(--accent-neon)',
                  marginTop: '2px',
                  flexShrink: 0,
                }}
              />
              <div>
                <h5
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#fff',
                  }}
                >
                  FIFA World Cup Live
                </h5>
                <p
                  style={{
                    margin: '3px 0 0 0',
                    color: 'var(--text-muted)',
                    fontSize: '12px',
                    lineHeight: '1.4',
                  }}
                >
                  Achtelfinals & Viertelfinals laufen!{' '}
                  <strong style={{ color: 'var(--accent-neon)' }}>
                    Anstoßzeiten:
                  </strong>{' '}
                  Wegen der Zeitverschiebung starten die Top-Spiele meist erst
                  ab 21:00 / 22:00 Uhr. Nutzt abends gezielt die markierten
                  WM-Kneipen.
                </p>
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div style={{ padding: '0 16px' }}>
            <div
              style={{
                height: '200px',
                width: '100%',
                borderRadius: '24px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              }}
            >
              <MapContainer
                center={pilsenCenter}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution="&copy; CARTO"
                />
                <MapAnimator
                  coordinates={selectedPlace ? selectedPlace.coordinates : null}
                />

                <Marker position={[49.7469, 13.3782]} icon={redIcon}>
                  <Popup autoOpenOnMapBlock={true}>
                    <div style={{ padding: '4px', textAlign: 'center' }}>
                      <strong
                        style={{
                          fontSize: '14px',
                          display: 'block',
                          marginBottom: '2px',
                          color: '#000',
                        }}
                      >
                        Hotel Central
                      </strong>
                      <span
                        style={{
                          fontSize: '12px',
                          color: '#ef4444',
                          fontWeight: 'bold',
                        }}
                      >
                        📍 Euer Basecamp
                      </span>
                    </div>
                  </Popup>
                </Marker>

                {selectedPlace && selectedPlace.id !== 'hotel_central' && (
                  <Marker position={selectedPlace.coordinates}>
                    <Popup autoOpenOnMapBlock={true}>
                      <div style={{ padding: '4px' }}>
                        <strong
                          style={{
                            fontSize: '14px',
                            display: 'block',
                            marginBottom: '2px',
                            color: '#000',
                          }}
                        >
                          {selectedPlace.name}
                        </strong>
                        <span
                          style={{
                            fontSize: '12px',
                            color: 'var(--accent-neon)',
                            fontWeight: 'bold',
                          }}
                        >
                          {selectedPlace.type}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
          </div>

          {/* Places List */}
          <main style={{ padding: '20px 16px 10px 16px' }}>
            <div style={{ display: 'grid', gap: '14px' }}>
              {filteredPlaces.map((place) => {
                const isSelected =
                  selectedPlace && selectedPlace.id === place.id;
                const isFav = favorites.includes(place.id);
                const isHotel = place.id === 'hotel_central';

                return (
                  <div
                    key={place.id}
                    onClick={() => setSelectedPlace(place)}
                    style={{
                      position: 'relative',
                      backgroundColor: isHotel
                        ? 'rgba(239, 68, 68, 0.05)'
                        : isSelected
                        ? 'var(--bg-card-hover)'
                        : 'var(--bg-card)',
                      border: isSelected
                        ? '1px solid var(--accent-neon)'
                        : isHotel
                        ? '1px solid rgba(239, 68, 68, 0.3)'
                        : '1px solid rgba(255,255,255,0.02)',
                      borderRadius: '20px',
                      padding: '18px',
                      cursor: 'pointer',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: isSelected
                        ? '0 10px 30px rgba(0,0,0,0.4), 0 0 20px var(--accent-glow)'
                        : '0 4px 20px rgba(0,0,0,0.2)',
                      transform: isSelected ? 'translateY(-2px)' : 'none',
                    }}
                  >
                    {!isHotel && (
                      <button
                        onClick={(e) => toggleFavorite(e, place.id)}
                        style={{
                          position: 'absolute',
                          top: '16px',
                          right: '16px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Heart
                          size={22}
                          fill={isFav ? '#ef4444' : 'transparent'}
                          color={isFav ? '#ef4444' : 'var(--text-muted)'}
                        />
                      </button>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '6px',
                        paddingRight: '30px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        {getIcon(place.category)}
                        <h3
                          style={{
                            margin: 0,
                            fontSize: '18px',
                            fontWeight: '700',
                            color: isHotel ? '#ef4444' : '#fff',
                          }}
                        >
                          {place.name}
                        </h3>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '10px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <MapPin
                          size={13}
                          style={{
                            color: isHotel ? '#ef4444' : 'var(--accent-neon)',
                          }}
                        />
                        <span
                          style={{
                            color: isHotel ? '#ef4444' : 'var(--accent-neon)',
                            fontSize: '12px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          {place.type}
                        </span>
                      </div>
                      {place.lunch_deal && (
                        <span
                          style={{
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            color: '#f59e0b',
                            padding: '2px 8px',
                            borderRadius: '99px',
                            fontSize: '11px',
                            fontWeight: '700',
                            border: '1px solid rgba(245, 158, 11, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Flame size={12} /> Mittagstisch
                        </span>
                      )}
                      {place.secret_tip && (
                        <span
                          style={{
                            backgroundColor: 'rgba(168, 85, 247, 0.1)',
                            color: '#a855f7',
                            padding: '2px 8px',
                            borderRadius: '99px',
                            fontSize: '11px',
                            fontWeight: '700',
                            border: '1px solid rgba(168, 85, 247, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Sparkles size={12} /> Geheimtipp
                        </span>
                      )}
                      {place.wm_spot && (
                        <span
                          style={{
                            backgroundColor: 'rgba(14, 165, 233, 0.1)',
                            color: 'var(--accent-neon)',
                            padding: '2px 8px',
                            borderRadius: '99px',
                            fontSize: '11px',
                            fontWeight: '700',
                            border: '1px solid rgba(14, 165, 233, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          ⚽ WM-Kneipe
                        </span>
                      )}
                    </div>

                    <p
                      style={{
                        margin: '0',
                        color: 'var(--text-muted)',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        fontWeight: '400',
                      }}
                    >
                      {place.description}
                    </p>

                    {place.prices && place.prices.length > 0 && (
                      <div
                        style={{
                          marginTop: '14px',
                          padding: '12px',
                          backgroundColor: 'rgba(0,0,0,0.25)',
                          borderRadius: '12px',
                          border: '1px solid rgba(255,255,255,0.03)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginBottom: '8px',
                          }}
                        >
                          <Banknote size={14} style={{ color: '#10b981' }} />
                          <span
                            style={{
                              color: '#94a3b8',
                              fontSize: '11px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              fontWeight: '700',
                            }}
                          >
                            Typische Preise
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                          }}
                        >
                          {place.prices.map((item, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '13px',
                              }}
                            >
                              <span style={{ color: '#e2e8f0' }}>
                                {item.item}
                              </span>
                              <span
                                style={{
                                  color: '#10b981',
                                  fontWeight: '600',
                                  whiteSpace: 'nowrap',
                                  marginLeft: '10px',
                                }}
                              >
                                {item.cost}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </main>
        </>
      ) : (
        /* REINE SPARTE: Der exklusive Crew-Bierdeckel */
        <main style={{ padding: '10px 16px' }}>
          <div style={{ display: 'grid', gap: '16px' }}>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: '800',
                margin: '10px 0 5px 0',
                background: 'linear-gradient(45deg, #f59e0b, #d97706)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              🍻 Crew-Wertung
            </h2>
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '14px',
                margin: '0 0 10px 0',
                lineHeight: '1.4',
              }}
            >
              Hier wird abgerechnet. Jeder trackt seine eigenen Runden für die
              10 Tage Pilsen.
            </p>

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
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid rgba(255, 255, 255, 0.02)',
                  borderRadius: '24px',
                  padding: '20px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '14px' }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid rgba(245, 158, 11, 0.15)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#f59e0b',
                    }}
                  >
                    {user.name[0]}
                  </div>
                  <div>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#fff',
                      }}
                    >
                      {user.name}
                    </h4>
                    <p
                      style={{
                        margin: '2px 0 0 0',
                        color: 'var(--text-muted)',
                        fontSize: '12px',
                      }}
                    >
                      Pilsner Urquell
                    </p>
                  </div>
                </div>

                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '18px' }}
                >
                  <button
                    onClick={() => updateBeer(user.id, -1)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      border: 'none',
                      color: '#fff',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Minus size={16} />
                  </button>
                  <span
                    style={{
                      fontSize: '26px',
                      fontWeight: '900',
                      color: '#f59e0b',
                      minWidth: '32px',
                      textAlign: 'center',
                      textShadow: '0 0 12px rgba(245, 158, 11, 0.3)',
                    }}
                  >
                    {crewBeers[user.id]}
                  </span>
                  <button
                    onClick={() => updateBeer(user.id, 1)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#f59e0b',
                      border: 'none',
                      color: '#000',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* Floating Action Button (Zufalls-Würfel) - Nur sichtbar, wenn wir nicht im Tracker-Tab sind */}
      {activeFilter !== 'beer_tracker' && (
        <button
          onClick={rollTheDice}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '20px',
            background: 'linear-gradient(135deg, var(--accent-neon), #0284c7)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '64px',
            height: '64px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow:
              '0 8px 25px rgba(14, 165, 233, 0.5), inset 0 2px 4px rgba(255,255,255,0.2)',
            cursor: 'pointer',
            zIndex: 1000,
            transition: 'transform 0.1s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Dices size={30} />
        </button>
      )}
    </div>
  );
}

export default App;
