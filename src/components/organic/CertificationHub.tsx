/**
 * 🔥 CERTIFICATION HUB - ULTRA SIMPLE ORGANIC CERTIFICATION
 * Step-by-step guidance to organic certification
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { CheckCircle, Clock, FileText, Award, Download, ExternalLink } from 'lucide-react';

interface CertificationStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  documents: string[];
  timeframe: string;
}

export const CertificationHub: React.FC = () => {
  const [steps] = useState<CertificationStep[]>([
    {
      id: 'application',
      title: 'Submit Application',
      description: 'Complete organic certification application form',
      completed: true,
      documents: ['Application Form', 'Farm Map', 'Production Plan'],
      timeframe: '1 week'
    },
    {
      id: 'transition',
      title: 'Transition Period',
      description: '36-month transition to organic practices',
      completed: false,
      documents: ['Practice Records', 'Input Records', 'Sales Records'],
      timeframe: '36 months'
    },
    {
      id: 'inspection',
      title: 'Farm Inspection',
      description: 'Certified inspector visits your farm',
      completed: false,
      documents: ['Inspection Report', 'Corrective Actions'],
      timeframe: '1 day'
    },
    {
      id: 'certification',
      title: 'Receive Certificate',
      description: 'Get your organic certification',
      completed: false,
      documents: ['Organic Certificate', 'Scope of Certification'],
      timeframe: '2 weeks'
    }
  ]);

  const completedSteps = steps.filter(s => s.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6 text-green-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Organic Certification Hub
            </span>
          </CardTitle>
          <p className="text-gray-600">
            📜 Your step-by-step guide to organic certification success
          </p>
        </CardHeader>
        <CardContent>
          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Certification Progress</span>
              <span className="text-sm font-bold text-green-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{completedSteps}</div>
              <div className="text-xs text-gray-600">Steps Complete</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{steps.length - completedSteps}</div>
              <div className="text-xs text-gray-600">Steps Remaining</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">36</div>
              <div className="text-xs text-gray-600">Months Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certification Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <Card key={step.id} className={`${step.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Step Number/Status */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                  step.completed ? 'bg-green-600' : 'bg-gray-400'
                }`}>
                  {step.completed ? <CheckCircle className="h-5 w-5" /> : index + 1}
                </div>
                
                {/* Step Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-800">{step.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {step.timeframe}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-sm mb-3">{step.description}</p>
                  
                  {/* Documents */}
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-800 text-sm mb-2 flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      Required Documents:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {step.documents.map(doc => (
                        <span key={doc} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    {step.completed ? (
                      <Button size="sm" variant="outline" className="text-green-600 border-green-300">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completed
                      </Button>
                    ) : (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Start Step
                      </Button>
                    )}
                    
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Templates
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resources */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <FileText className="h-5 w-5" />
            Certification Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-bold text-gray-800">📋 Document Templates</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-blue-600" />
                  <span>Organic System Plan Template</span>
                </li>
                <li className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-blue-600" />
                  <span>Record Keeping Forms</span>
                </li>
                <li className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-blue-600" />
                  <span>Input Approval Lists</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-bold text-gray-800">🔗 Helpful Links</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                  <span>Organic Standards Guide</span>
                </li>
                <li className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                  <span>Certification Body Directory</span>
                </li>
                <li className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                  <span>Cost Share Programs</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support CTA */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="text-center py-6">
          <Award className="h-12 w-12 mx-auto mb-4 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">Need Expert Help?</h3>
          <p className="text-gray-600 mb-4">
            Get personalized certification guidance from our organic experts
          </p>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <ExternalLink className="h-4 w-4 mr-2" />
            Book Consultation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};