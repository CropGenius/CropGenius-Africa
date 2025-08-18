"use client";

import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function NotFoundPage() {
  const navigate = useNavigate();
  
  return (
    <section className="bg-white font-serif min-h-screen flex items-center justify-center">
      <div className="container mx-auto">
        <div className="flex justify-center">
          <div className="w-full sm:w-10/12 md:w-8/12 text-center">
            <div
              className="bg-[url('https://images.unsplash.com/photo-1578328819058-b69f3a3b0d63?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80')] h-[250px] sm:h-[350px] md:h-[400px] bg-center bg-cover bg-no-repeat rounded-lg"
              aria-hidden="true"
            >
              <h1 className="text-center text-white text-6xl sm:text-7xl md:text-8xl pt-6 sm:pt-8 drop-shadow-lg">
                404
              </h1>
            </div>

            <div className="mt-[-50px] bg-white p-6 rounded-lg shadow-lg mx-4">
              <h3 className="text-2xl text-gray-800 sm:text-3xl font-bold mb-4">
                Look like you're lost
              </h3>
              <p className="mb-6 text-gray-600 sm:mb-5">
                The page you are looking for is not available!
              </p>

              <Button
                variant="default"
                onClick={() => navigate('/')}
                className="my-5 bg-green-600 hover:bg-green-700 px-6 py-2"
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
