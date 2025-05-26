
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home, Search, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* 404 Animation */}
        <div className="relative">
          <div className="text-9xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent animate-pulse">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 animate-float">
              <div className="h-full w-full rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-600/30 flex items-center justify-center">
                <Search className="h-12 w-12 text-indigo-600 animate-bounce" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Card */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md">
          <CardHeader className="pb-4 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              Page Not Found
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Oops! The page you're looking for seems to have wandered off into the digital void.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                Don't worry, it happens to the best of us! The page you're trying to reach might have been moved, 
                deleted, or perhaps you've stumbled upon a typo in the URL.
              </p>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-2">Here's what you can do:</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Check the URL for any typos</li>
                  <li>• Go back to the previous page</li>
                  <li>• Visit our homepage to start fresh</li>
                  <li>• Use the navigation menu to find what you need</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-300">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Homepage
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="border-gray-200 hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                If you believe this is an error, please contact our support team.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 h-16 w-16 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-600/20 animate-float" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-20 right-20 h-12 w-12 rounded-full bg-gradient-to-br from-purple-400/20 to-indigo-600/20 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-10 h-8 w-8 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-600/20 animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>
    </div>
  );
};

export default NotFound;
