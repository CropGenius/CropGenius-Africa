/**
 * 🔥 EXPORT MARKET PLATFORM - ULTRA SIMPLE GLOBAL MARKETPLACE
 * Connect organic farmers with international buyers
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Globe, DollarSign, TrendingUp, Users, MapPin, Star, MessageCircle } from 'lucide-react';

interface Buyer {
  id: string;
  name: string;
  country: string;
  crops: string[];
  price: number;
  volume: string;
  rating: number;
  verified: boolean;
}

interface MarketOpportunity {
  crop: string;
  demand: 'high' | 'medium' | 'low';
  price: number;
  growth: number;
  countries: string[];
}

export const ExportMarketPlatform: React.FC = () => {
  const [buyers] = useState<Buyer[]>([
    {
      id: '1',
      name: 'EuroOrganic Ltd',
      country: 'Germany',
      crops: ['Tomatoes', 'Carrots', 'Spinach'],
      price: 4.50,
      volume: '500 tons/month',
      rating: 4.8,
      verified: true
    },
    {
      id: '2',
      name: 'Green Valley Co',
      country: 'USA',
      crops: ['Maize', 'Beans'],
      price: 3.20,
      volume: '1000 tons/month',
      rating: 4.6,
      verified: true
    },
    {
      id: '3',
      name: 'Nordic Fresh',
      country: 'Sweden',
      crops: ['Carrots', 'Spinach'],
      price: 5.10,
      volume: '200 tons/month',
      rating: 4.9,
      verified: true
    }
  ]);

  const [opportunities] = useState<MarketOpportunity[]>([
    {
      crop: 'Tomatoes',
      demand: 'high',
      price: 4.50,
      growth: 15,
      countries: ['Germany', 'UK', 'France']
    },
    {
      crop: 'Carrots',
      demand: 'high',
      price: 3.80,
      growth: 12,
      countries: ['Sweden', 'Norway', 'Denmark']
    },
    {
      crop: 'Spinach',
      demand: 'medium',
      price: 6.20,
      growth: 8,
      countries: ['Netherlands', 'Belgium']
    }
  ]);

  const totalBuyers = buyers.length * 10; // Simulate more buyers
  const totalVolume = buyers.reduce((sum, buyer) => sum + parseInt(buyer.volume), 0);
  const avgPrice = buyers.reduce((sum, buyer) => sum + buyer.price, 0) / buyers.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Export Market Platform
            </span>
          </CardTitle>
          <p className="text-gray-600">
            🌍 Connect with international organic buyers and access premium markets
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{totalBuyers}+</div>
              <div className="text-xs text-gray-600">Active Buyers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">${avgPrice.toFixed(2)}</div>
              <div className="text-xs text-gray-600">Avg Price/kg</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">50+</div>
              <div className="text-xs text-gray-600">Countries</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Opportunities */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Hot Market Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {opportunities.map((opp, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-bold text-gray-800">{opp.crop}</div>
                  <div className="text-sm text-gray-600">
                    {opp.countries.join(', ')} • {opp.demand.toUpperCase()} demand
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">${opp.price}/kg</div>
                  <div className="text-xs text-green-600">+{opp.growth}% growth</div>
                </div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Connect
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Buyers */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Premium Buyers Looking for Your Crops
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {buyers.map(buyer => (
              <div key={buyer.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-800">{buyer.name}</h3>
                      {buyer.verified && (
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                      <MapPin className="h-3 w-3" />
                      {buyer.country}
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{buyer.rating}</span>
                      </div>
                      <span className="text-sm text-gray-600">• {buyer.volume}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">${buyer.price}</div>
                    <div className="text-xs text-gray-600">per kg</div>
                  </div>
                </div>
                
                {/* Crops */}
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">Looking for:</div>
                  <div className="flex flex-wrap gap-1">
                    {buyer.crops.map(crop => (
                      <span key={crop} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 flex-1">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Send Quote
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Message
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Success Stories */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Star className="h-5 w-5" />
            Success Stories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-green-600">MK</span>
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-sm">Mary Kiprotich</div>
                  <div className="text-xs text-gray-600">Kenya • Tomato Farmer</div>
                </div>
              </div>
              <p className="text-sm text-gray-700 italic">
                "Connected with German buyers through CropGenius. Now earning 3x more for my organic tomatoes!"
              </p>
              <div className="text-xs text-green-600 mt-1">💰 Increased income by 300%</div>
            </div>
            
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">JM</span>
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-sm">John Mwangi</div>
                  <div className="text-xs text-gray-600">Uganda • Carrot Farmer</div>
                </div>
              </div>
              <p className="text-sm text-gray-700 italic">
                "Export platform helped me find Nordic buyers. Consistent orders, premium prices!"
              </p>
              <div className="text-xs text-blue-600 mt-1">📈 Stable export contracts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Get Started CTA */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="text-center py-6">
          <Globe className="h-12 w-12 mx-auto mb-4 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">Ready to Go Global?</h3>
          <p className="text-gray-600 mb-4">
            Join 1000+ farmers already exporting organic produce worldwide
          </p>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Globe className="h-4 w-4 mr-2" />
            Start Exporting
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};