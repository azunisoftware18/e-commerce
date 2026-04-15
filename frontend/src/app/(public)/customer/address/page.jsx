"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import AddressForm from "@/components/forms/AddressForm";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import {
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  Home,
  X,
  Map,
  ArrowLeft,
  PlusCircle,
} from "lucide-react";
import {
  addAddress,
  removeAddress,
  selectAddress,
  setAddress,
  updateAddress,
} from "@/store/slices/addressSlice";
import AuthGuard from "@/components/common/AuthGuard";
import Loader from "@/components/common/Loader";

export default function AddressPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const { addresses, selectedAddressId } = useSelector(
    (state) => state.address,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    pinCode: "",
    city: "",
    state: "",
    address: "",
  });

  const handleSave = () => {
  if (
    !formData.firstName ||
    !formData.email ||
    !formData.pinCode ||
    !formData.city ||
    !formData.state ||
    !formData.address
  ) {
    toast.error("Please fill all fields");
    return;
  }

  if (editId) {
    // ✅ UPDATE
    dispatch(updateAddress({ ...formData, id: editId }));
    toast.success("Address Updated");
  } else {
    // ✅ CREATE
    dispatch(addAddress({ ...formData, id: Date.now() }));
    toast.success("Address Saved");
  }

  // reset
  setFormData({
    firstName: "",
    lastName: "",
    email: "",
    pinCode: "",
    city: "",
    state: "",
    address: "",
  });

  setEditId(null);
  setShowForm(false);
};

  useEffect(() => {
    const data = localStorage.getItem("address");
    if (data) {
      dispatch(setAddress(JSON.parse(data)));
    }

    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <Loader fullScreen text="Fetching saved addresses" />;
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
        <header className="bg-[#F8FAFC] backdrop-blur-md sticky top-0 z-30  px-6 py-4">
          <div className="w-full mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all border border-slate-100"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight">
                  My Addresses
                </h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em]">
                  Manage Shipping Locations
                </p>
              </div>
            </div>

            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-[#2A4150] text-white rounded-xl text-xs font-bold hover:bg-[#1e2f3a] transition-all shadow-lg shadow-blue-900/10"
              >
                <Plus size={14} /> Add New Address
              </button>
            )}
          </div>
        </header>

        <main className="w-full mx-auto px-6 py-10">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="sm:hidden w-full flex items-center justify-center gap-2 mb-6 p-4 bg-[#2A4150] text-white rounded-2xl font-bold text-sm shadow-lg"
            >
              <PlusCircle size={18} /> Add New Address
            </button>
          )}

          {showForm && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] mb-12 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-black text-slate-800">
  {editId ? "Edit Address" : "New Address"}
</h2>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                    Fill in the delivery details
                  </p>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <AddressForm value={formData} onChange={setFormData} />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-10">
                <Button
                  text={editId ? "Update Address" : "Save This Location"}
                  onClick={handleSave}
                  className="flex-2 py-4 rounded-2xl bg-[#2A4150] shadow-lg shadow-blue-900/20 font-black uppercase tracking-widest text-xs"
                />
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 rounded-2xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* 📦 SAVED ADDRESSES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addresses.length === 0 && !showForm && (
              <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Map className="text-slate-200" size={40} />
                </div>
                <p className="text-slate-900 font-black text-lg">
                  No Addresses Saved Yet
                </p>
                <p className="text-slate-400 text-sm mb-6 text-center px-4">
                  Add an address to speed up your checkout process.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-[#2A4150] text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-blue-900/20"
                >
                  Add First Address
                </button>
              </div>
            )}

            {addresses.map((addr) => {
              const isSelected = selectedAddressId === addr.id;
              return (
                <div
                  key={addr.id}
                  onClick={() => dispatch(selectAddress(addr.id))}
                  className={`relative group p-6 cursor-pointer transition-all duration-500 rounded-4xl border-2 overflow-hidden ${
                    isSelected
                      ? "border-[#2A4150] bg-white shadow-[0_20px_50px_-12px_rgba(42,65,80,0.15)] scale-[1.01] z-10"
                      : "border-transparent bg-white hover:border-slate-200 shadow-sm hover:shadow-md"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#2A4150]/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                  )}

                  <div className="flex flex-col h-full relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          isSelected
                            ? "bg-[#2A4150] text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {isSelected ? "Default Destination" : "Saved Location"}
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="text-[#2A4150]" size={22} />
                      )}
                    </div>

                    <div className="flex gap-4">
                      <div
                        className={`mt-1 p-2 rounded-lg h-fit ${isSelected ? "bg-[#2A4150]/10 text-[#2A4150]" : "bg-slate-50 text-slate-400"}`}
                      >
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-lg leading-tight mb-1">
                          {addr.firstName} {addr.lastName}
                        </p>
                        <p className="font-bold text-slate-800">
                          {addr.address}
                        </p>
                        <p className="text-slate-500 text-sm font-medium">
                          {addr.city}, {addr.state}
                        </p>
                        <p className="text-[#2A4150] font-mono text-sm mt-2 font-bold bg-slate-50 w-fit px-2 py-0.5 rounded">
                          {addr.pinCode}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-50">
                      <span
                        className={`text-[10px] font-black uppercase tracking-tighter ${isSelected ? "text-slate-800" : "text-slate-800"}`}
                      >
                        {isSelected
                          ? "Ready for Delivery"
                          : "Select for Delivery"}
                      </span>

                      <div className="flex items-center gap-2">
  {/* EDIT */}
  <button
    onClick={(e) => {
      e.stopPropagation();
      setFormData(addr);
      setEditId(addr.id);
      setShowForm(true);
    }}
    className="px-3 py-1.5 text-blue-500 hover:bg-blue-50 rounded-xl text-xs font-bold"
  >
    Edit
  </button>

  {/* DELETE */}
  <button
    onClick={(e) => {
      e.stopPropagation();
      dispatch(removeAddress(addr.id));
      toast.success("Address Deleted");
    }}
    className="flex items-center gap-1.5 px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-xl"
  >
    <Trash2 size={14} />
    <span className="text-[10px] font-black uppercase tracking-widest">
      Delete
    </span>
  </button>
</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
