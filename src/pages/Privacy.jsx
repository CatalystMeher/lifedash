import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
  return (
    <div className=" bg-gray-50 dark:bg-gray-900 flex flex-col">
        <div className='flex min-h-screen'>
      <div className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/settings" 
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Settings
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Welcome to LifeDash ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our life tracking application. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Information We Collect
            </h2>
            
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
              2.1 Personal Information
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>Account information (email address, name)</li>
              <li>Life tracking data (stats, habits, todos, focus sessions)</li>
              <li>User preferences and settings</li>
              <li>Analytics and progress data</li>
              <li>AI chat interactions (temporarily stored in browser session)</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3 mt-6">
              2.2 Automatically Collected Information
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We automatically collect certain information when you use our app:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>Device information (device type, operating system)</li>
              <li>App usage data and analytics</li>
              <li>Error logs and performance data</li>
              <li>Network information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>Provide and maintain our life tracking services</li>
              <li>Process and store your personal data and tracking information</li>
              <li>Generate analytics and insights about your progress</li>
              <li>Provide AI-powered recommendations and assistance</li>
              <li>Improve our app functionality and user experience</li>
              <li>Send important updates and notifications</li>
              <li>Ensure app security and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Data Storage and Security
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Your data is stored securely using Supabase, a trusted cloud platform:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li>All data is encrypted in transit and at rest</li>
              <li>We use Row Level Security (RLS) to ensure data isolation</li>
              <li>Your data is only accessible to you and our secure systems</li>
              <li>Regular security audits and monitoring are performed</li>
              <li>AI chat conversations are not permanently stored</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Third-Party Services
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We use the following third-party services:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li><strong>Supabase:</strong> Database and authentication services</li>
              <li><strong>OpenAI:</strong> AI chat functionality (data is not stored by OpenAI)</li>
              <li><strong>Analytics services:</strong> To improve app performance</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              These services have their own privacy policies, and we recommend reviewing them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Your Rights and Choices
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
              <li><strong>Access:</strong> View and download your data</li>
              <li><strong>Correction:</strong> Update or correct your information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Portability:</strong> Export your data in a standard format</li>
              <li><strong>Opt-out:</strong> Disable certain features or data collection</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Data Retention
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We retain your personal information for as long as your account is active or as needed to provide services. You can delete your account at any time through the app settings. Upon account deletion, your data will be permanently removed from our systems within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Children's Privacy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Our app is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              10. Contact Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Email:</strong> catalystmedia.business@gmail.com<br />
                <strong>Support:</strong> catalystmedia.business@gmail.com
              </p>
            </div>
          </section>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              This Privacy Policy is effective as of {new Date().toLocaleDateString()}. 
              By using LifeDash, you agree to the collection and use of information in accordance with this policy.
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
