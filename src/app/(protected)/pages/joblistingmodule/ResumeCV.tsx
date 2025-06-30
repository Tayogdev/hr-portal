import React from 'react';
import Image from 'next/image';

type ResumeCVProps = {
  linkedin?: string;
  portfolio?: string;
};

type Education = {
  degree: string;
  institute: string;
  score: string;
  year: string;
};

const educationData: Education[] = [
  {
    degree: "Bachelor of Design",
    institute: "IIT Hyderabad",
    score: "8.82",
    year: "2025"
  },
  {
    degree: "Minor in Entrepreneurship",
    institute: "IIT Hyderabad",
    score: "8.50",
    year: "2025"
  },
  {
    degree: "XII (PCMB) CBSE",
    institute: "Jawahar Navodaya Vidyalaya, Jaipur",
    score: "86%",
    year: "2020"
  },
  {
    degree: "X (General studies) CBSE",
    institute: "Jawahar Navodaya Vidyalaya, Jaipur",
    score: "87.6%",
    year: "2018"
  }
];

export default function ResumeCV({ linkedin, portfolio }: ResumeCVProps): React.JSX.Element {
  return (
    <div className="bg-white">
      {/* Header with Name and Links */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-orange-50 p-2.5 rounded-lg">
            <Image
              src="/education-icon.svg"
              alt="Education"
              width={20}
              height={20}
              className="text-orange-500"
            />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Gatikrushna Mohapatra</h2>
        </div>
        <div className="flex items-center gap-4">
          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600"
            >
              <Image
                src="/linkedin-icon.svg"
                alt="LinkedIn"
                width={18}
                height={18}
              />
              LinkedIn
            </a>
          )}
          {portfolio && (
            <a
              href={portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-blue-600"
            >
              Portfolio
            </a>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <p className="text-sm text-gray-600 mb-8">
        B.Des student from IIT Hyderabad, passionate about designing practical solutions.
        <br />
        Contact: bd21bdes11008@iith.ac.in
      </p>

      {/* Education Table */}
      <div className="mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 border-b border-gray-200">Degree</th>
              <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 border-b border-gray-200">Institute</th>
              <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 border-b border-gray-200">CGPA / %</th>
              <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 border-b border-gray-200">Year</th>
            </tr>
          </thead>
          <tbody>
            {educationData.map((edu, index) => (
              <tr key={index} className="border-b border-gray-100 last:border-0">
                <td className="py-3 px-4 text-sm text-gray-800">{edu.degree}</td>
                <td className="py-3 px-4 text-sm text-gray-800">{edu.institute}</td>
                <td className="py-3 px-4 text-sm text-gray-800">{edu.score}</td>
                <td className="py-3 px-4 text-sm text-gray-800">{edu.year}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Work Experience */}
      <div>
        <h3 className="text-base font-medium text-gray-900 mb-4">Work Experience</h3>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-900">Suzuki Innovation Center (SIC) / Visual Designer</span>
            <span className="text-gray-600">July 2023 - October 2023</span>
          </div>
          <div className="text-sm text-gray-600">
            <p>Hyderabad (Internship)</p>
            <p className="mt-2">
              Worked on a project that deals with vending machine installation in the rural areas of Telangana as an alternative to defunct stores. As a visual designer,
            </p>
            <p className="mt-1">
              Improved the vending machine&apos;s visual appeal by creating a comprehensive sticker design featuring relatable
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
