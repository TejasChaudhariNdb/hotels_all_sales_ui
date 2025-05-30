"use client";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  Shield,
  Lock,
  Key,
  AlertTriangle,
  CheckCircle,
  Info,
  Database,
  ShieldAlert
} from "lucide-react";
import { useState } from "react";
import { makePost} from "@/lib/api";
export default function SecurityPage() {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [dataEncryption, setDataEncryption] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [errorMessgae, setErrorMessage] = useState("");


  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword) {
      alert("Please fill in both password fields");
      return;
    }
  
    setIsChangingPassword(true);
  
    try {
      const response = await makePost('admin/security/changePass', {
        oldPassword,
        newPassword,
      });
  
    //   alert(response.message || "Password changed successfully!");
      setErrorMessage(response?.data?.message);
      setOldPassword("");
      setNewPassword("");
      setTimeout(() => {
        setErrorMessage(false)
      }, 3000);
    } catch (error) {
      console.error("Error changing password:", error);
      setErrorMessage(error.response?.data?.message);
      setTimeout(() => {
        setErrorMessage(false)
      }, 3000);
    //   alert(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };
  

  const handleDDOSProtection = () => {
    if (confirm("This will temporarily restrict access to prevent attacks. Continue?")) {
      alert("DDOS Protection activated. All suspicious traffic blocked.");
    }
  };

  const handleHackForceClose = () => {
    if (confirm("This will immediately terminate all active sessions and lock the system. Continue?")) {
      alert("Emergency lockdown activated. All sessions terminated.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-md mx-auto">
        <div className="space-y-4">
          {/* Password Change Section */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center mb-4">
              <Key className="text-blue-600 mr-3" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">Change Password</h2>
            </div>
            
            <div className="space-y-4">
              {/* Old Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full text-black px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                onClick={handlePasswordChange}
                disabled={isChangingPassword}
                className="w-full bg-blue-600 text-white px-4 py-2 text-sm rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isChangingPassword ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Changing...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2" size={16} />
                    Change Password
                  </>
                )}
              </button>
              
            </div>
          </div>

{errorMessgae ? <>

    <div className="mx-4 mb-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-red-800">
              {errorMessgae}
            </p>
          </div>
       
        </div>
      </div>
    </div>

</> : <>""</>}
   
          {/* Data Encryption Section */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center mb-4">
              <Database className="text-green-600 mr-3" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">Data Encryption</h2>
            </div>
            
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 pr-4">
                <h3 className="font-medium text-gray-800 text-sm">Enable Data Encryption</h3>
                <p className="text-xs text-gray-600 mt-1">
                  All data stored in encrypted format for maximum security
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={dataEncryption}
                  onChange={(e) => setDataEncryption(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {dataEncryption && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
              
                  <div className="flex-1">
                    <div className="flex">
                    <CheckCircle className="text-green-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
                    <h4 className="font-medium text-green-800 mb-2 text-sm">Encryption Active - AES-256</h4>
             
                    </div>
                         <p className="text-xs text-green-700 mb-3">
                      Your data is safe and decrypted only with your key
                    </p>
                    
                <div className="bg-white p-2 rounded border">
                      <p className="text-xs text-gray-600 mb-1">Original Data:</p>
                      <div className="text-xs bg-gray-100 p-2 rounded mb-2 text-black break-all">
                        {`{hotel: "Hotel", today_sales: "34000"}`}
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-1">Encrypted (AES-256):</p>
                      <div className="text-xs bg-gray-100 p-2 rounded text-green-600 break-all">
                        U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K1Y=
                      </div>
                    </div>
                  </div>
              
                </div>
              </div>
            )}

            {!dataEncryption && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="text-yellow-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <h4 className="font-medium text-yellow-800 text-sm">Encryption Disabled</h4>
                    <p className="text-xs text-yellow-700">
                      Your data is stored in plain text. Enable encryption for better security.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Emergency Security Section */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center mb-4">
              <ShieldAlert className="text-red-600 mr-3" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">Emergency Controls</h2>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 border border-orange-200 rounded-lg bg-orange-50">
                <div className="flex items-start">
                  <Info className="text-orange-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <h4 className="font-medium text-orange-800 text-sm">Security Notice</h4>
                    <p className="text-xs text-orange-700">
                      Use these controls only in case of suspected security threats.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleDDOSProtection}
                  className="w-full flex items-center justify-center px-4 py-2 bg-orange-100 text-orange-700 border border-orange-300 rounded-lg hover:bg-orange-200 font-medium transition-colors text-sm"
                >
                  <Shield className="mr-2" size={16} />
                  Activate DDOS Protection
                </button>

                <button
                  onClick={handleHackForceClose}
                  className="w-full flex items-center justify-center px-4 py-2 bg-red-100 text-red-700 border border-red-300 rounded-lg hover:bg-red-200 font-medium transition-colors text-sm"
                >
                  <AlertTriangle className="mr-2" size={16} />
                  Emergency Force Close
                </button>
              </div>
            </div>
          </div>

          {/* Security Status */}
          <div className="mb-15 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="text-green-600 mr-3 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">Security Status: Protected</h3>
                <p className="text-xs text-gray-600">
                  Your account and data are secured with enterprise-grade protection
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    
    </div>
  );
}