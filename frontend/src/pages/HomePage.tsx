import React from 'react';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-12 text-white text-center">
        <h1 className="text-4xl font-bold mb-4">
          欢迎来到技能集市
        </h1>
        <p className="text-xl mb-8">
          连接优秀的技能服务提供者，找到您需要的专业服务
        </p>
        <div className="flex justify-center space-x-4">
          <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">
            浏览服务
          </button>
          <button className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600">
            成为服务提供者
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-8">为什么选择我们</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">专业人才</h3>
            <p className="text-gray-600">经过严格筛选的专业技能服务提供者</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">质量保证</h3>
            <p className="text-gray-600">完善的质量保障体系和评价机制</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">快速高效</h3>
            <p className="text-gray-600">快速匹配需求，高效完成项目</p>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-8">热门服务</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-full h-32 bg-gray-200 rounded mb-4"></div>
              <h3 className="font-semibold mb-2">服务标题 {i}</h3>
              <p className="text-gray-600 text-sm mb-4">服务描述信息...</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-blue-600">¥{99 * i}</span>
                <button className="text-blue-600 hover:text-blue-800 font-medium">
                  查看详情
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gray-50 rounded-lg p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">准备开始您的项目？</h2>
        <p className="text-xl text-gray-600 mb-8">
          立即发布需求，获得专业服务
        </p>
        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
          发布项目需求
        </button>
      </section>
    </div>
  );
};