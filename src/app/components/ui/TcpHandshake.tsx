import React, { useState } from 'react';

const TCPHandshake: React.FC = () => {
  const [step, setStep] = useState<number>(0);

  const nextStep = () => setStep((p) => Math.min(p + 1, 4));
  const prevStep = () => setStep((p) => Math.max(p - 1, 0));
  const reset = () => setStep(0);

  // Helper untuk Status Klien
  const getClientStatus = () => {
    if (step === 0) return 'CLOSED';
    if (step === 1 || step === 2) return 'SYN_SENT';
    return 'ESTABLISHED';
  };

  // Helper untuk Status Server
  const getServerStatus = () => {
    if (step === 0 || step === 1) return 'LISTEN';
    if (step === 2) return 'SYN_RECEIVED';
    return 'ESTABLISHED';
  };

  return (
    <div className="flex flex-col items-center p-6 bg-blue-50 min-h-screen font-sans">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-blue-900 tracking-wider" style={{ textShadow: '1px 1px 2px white' }}>
          ALUR KERJA TCP THREE-WAY HANDSHAKE
        </h1>
        <h2 className="text-xl font-bold text-gray-800">(LANGKAH MEMBANGUN KONEKSI)</h2>
      </div>

      {/* Main Diagram Area */}
      <div className="flex flex-row w-full max-w-6xl justify-between items-stretch bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200">
        
        {/* KIRI: CLIENT */}
        <div className="flex flex-col items-center w-1/4 bg-gray-100 rounded-lg p-4 border-2 border-gray-300 z-10">
          <h3 className="text-xl font-bold mb-4 text-center">SUMBER<br/>(Klien)</h3>
          
          {/* Ikon Komputer */}
          <div className="w-24 h-24 bg-gray-300 rounded-md flex items-center justify-center mb-2 border-4 border-gray-700 relative">
            <div className="w-16 h-12 bg-blue-200 border-2 border-gray-600 rounded"></div>
            <div className="absolute -bottom-4 w-8 h-3 bg-gray-700"></div>
            <div className="absolute -bottom-6 w-16 h-2 bg-gray-700 rounded-sm"></div>
          </div>
          <p className="font-semibold text-gray-700 mb-8 mt-6">Komputer Sumber</p>

          {/* Status Box */}
          <div className="mt-auto border-2 border-dashed border-gray-600 p-3 w-full text-center bg-white">
            <p className="font-bold text-sm mb-2">STATUS KONEKSI:</p>
            <p className={`font-bold transition-colors duration-300 ${getClientStatus() === 'CLOSED' ? 'text-gray-500' : 'text-blue-600'}`}>
              {step === 0 && 'CLOSED'}
              {step > 0 && <span className="line-through text-gray-400 text-xs mr-1">CLOSED</span>}
              {step > 0 && step < 3 && 'SYN_SENT'}
            </p>
            {step >= 3 && (
              <p className="bg-green-200 text-green-900 font-bold px-2 py-1 mt-2 rounded border border-green-500">
                ESTABLISHED
              </p>
            )}
          </div>
        </div>

        {/* TENGAH: ANIMASI PANAH & PAKET */}
        <div className="flex flex-col justify-between w-1/2 px-4 relative py-8">
          
          {/* Langkah 1 */}
          <div className={`transition-all duration-700 transform ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <h4 className="font-bold text-center">LANGKAH 1: SYN (Sinkronisasi)</h4>
            <div className="flex items-center my-2">
              <div className="h-1 bg-black flex-grow"></div>
              <div className="w-4 h-4 border-t-4 border-r-4 border-black transform rotate-45 -ml-2"></div>
            </div>
            <div className="flex justify-center mb-2">
              <div className="flex border-2 border-black rounded overflow-hidden font-bold text-sm shadow-md">
                <div className="bg-green-300 px-3 py-1">SYN=1</div>
                <div className="bg-gray-300 border-l-2 border-black px-3 py-1">ACK=0</div>
              </div>
            </div>
            <p className="text-xs text-center text-gray-700 px-4">
              Sumber mengirim paket <strong>SYN</strong> awal berisi ISN (Initial Sequence Number) acak (misal: Seq=100).
            </p>
          </div>

          {/* Langkah 2 */}
          <div className={`transition-all duration-700 transform ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-x-8'}`}>
            <h4 className="font-bold text-center mt-6">LANGKAH 2: SYN-ACK (Sinkronisasi & Konfirmasi)</h4>
            <div className="flex items-center my-2">
              <div className="w-4 h-4 border-b-4 border-l-4 border-black transform rotate-45 -mr-2"></div>
              <div className="h-1 bg-black flex-grow"></div>
            </div>
            <div className="flex justify-center mb-2">
              <div className="flex border-2 border-black rounded overflow-hidden font-bold text-sm shadow-md">
                <div className="bg-green-300 px-3 py-1">SYN=1</div>
                <div className="bg-green-300 border-l-2 border-black px-3 py-1">ACK=1</div>
              </div>
            </div>
            <p className="text-xs text-center text-gray-700 px-4">
              Tujuan membalas dengan <strong>SYN</strong> sendiri (misal: Seq=500) dan <strong>ACK=101</strong> (yaitu: Seq sumber+1 sebagai tanda paket selanjutnya yang diharapkan).
            </p>
          </div>

          {/* Langkah 3 */}
          <div className={`transition-all duration-700 transform ${step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h4 className="font-bold text-center mt-6">LANGKAH 3: ACK (Konfirmasi)</h4>
            <div className="flex items-center my-2">
              <div className="h-1 bg-black flex-grow"></div>
              <div className="w-4 h-4 border-t-4 border-r-4 border-black transform rotate-45 -ml-2"></div>
            </div>
            <div className="flex justify-center mb-2">
              <div className="flex border-2 border-black rounded overflow-hidden font-bold text-sm shadow-md">
                <div className="bg-blue-300 px-3 py-1">SYN=0</div>
                <div className="bg-blue-300 border-l-2 border-black px-3 py-1">ACK=1</div>
              </div>
            </div>
            <p className="text-xs text-center text-gray-700 px-4">
              Sumber membalas kembali dengan <strong>ACK=501</strong> (yaitu: Seq tujuan+1) dan Seq=101.
            </p>
          </div>

          {/* Koneksi Valid Banner */}
          <div className={`mt-8 bg-green-600 text-white font-extrabold text-center py-2 rounded-lg shadow-lg transition-all duration-700 ${step >= 4 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            KONEKSI TERJALIN VALID
          </div>
        </div>

        {/* KANAN: SERVER */}
        <div className="flex flex-col items-center w-1/4 bg-gray-200 rounded-lg p-4 border-2 border-gray-300 z-10">
          <h3 className="text-xl font-bold mb-4 text-center">TUJUAN<br/>(Server)</h3>
          
          {/* Ikon Server */}
          <div className="w-20 h-32 bg-gray-700 rounded-md flex flex-col justify-evenly p-2 mb-2 border-4 border-gray-900 shadow-inner">
            <div className="w-full h-4 bg-gray-500 rounded flex items-center px-1 space-x-1">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            </div>
            <div className="w-full h-4 bg-gray-500 rounded flex items-center px-1 space-x-1">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
            </div>
            <div className="w-full h-4 bg-gray-500 rounded flex items-center px-1 space-x-1">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
            </div>
          </div>
          <p className="text-xs text-center font-semibold text-gray-700 mb-8 mt-2">Tujuan memproses,<br/>& generasi response</p>

          {/* Status Box */}
          <div className="mt-auto border-2 border-dashed border-gray-600 p-3 w-full text-center bg-white">
            <p className="font-bold text-sm mb-2">STATUS KONEKSI:</p>
            <p className={`font-bold transition-colors duration-300 ${getServerStatus() === 'LISTEN' ? 'text-gray-500' : 'text-blue-600'}`}>
              {step <= 1 && 'LISTEN'}
              {step > 1 && <span className="line-through text-gray-400 text-xs mr-1">LISTEN</span>}
              {step === 2 && 'SYN_RECEIVED'}
            </p>
            {step >= 3 && (
              <p className="bg-green-200 text-green-900 font-bold px-2 py-1 mt-2 rounded border border-green-500">
                ESTABLISHED
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className={`mt-6 text-center font-bold text-gray-800 transition-opacity duration-1000 ${step >= 4 ? 'opacity-100' : 'opacity-0'}`}>
        ➡️ SELANJUTNYA: PENGIRIMAN DATA DENGAN TCP SEQUENCE NUMBER & ERROR RECOVERY
      </div>

      {/* Kontrol Animasi */}
      <div className="mt-10 flex space-x-4 bg-white p-4 rounded-xl shadow border border-gray-200">
        <button 
          onClick={reset}
          disabled={step === 0}
          className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded disabled:opacity-50 hover:bg-red-200 transition"
        >
          Reset
        </button>
        <button 
          onClick={prevStep}
          disabled={step === 0}
          className="px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded disabled:opacity-50 hover:bg-gray-300 transition"
        >
          Kembali
        </button>
        <button 
          onClick={nextStep}
          disabled={step === 4}
          className="px-6 py-2 bg-blue-600 text-white font-bold rounded shadow disabled:opacity-50 hover:bg-blue-700 transition"
        >
          {step === 0 ? 'Mulai Handshake' : step < 4 ? 'Langkah Selanjutnya' : 'Selesai'}
        </button>
      </div>
    </div>
  );
};

export default TCPHandshake;