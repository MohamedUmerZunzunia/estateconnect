"use client";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";


import { useState } from "react";

const sampleAgents  = [
  {
    name: "Amelia Carter",
    location: "Dubai, UAE",
    specialty: "Luxury property",
    languages: "English, Arabic",
  },
  {
    name: "Lucas Martin",
    location: "Marbella, Spain",
    specialty: "Residential sales",
    languages: "English, Spanish, French",
  },
  {
    name: "Sara Hassan",
    location: "Abu Dhabi, UAE",
    specialty: "Property investment",
    languages: "English, Arabic",
  },
];

const opportunities = [
  {
    type: "BUYER REQUEST",
    title: "Looking for a luxury apartment in Dubai",
    detail: "Budget: €500,000–€800,000 · Dubai, UAE",
    name: "Olivia Bennett",
    initials: "OB",
    color: "#dce9df",
  },
  {
    type: "AGENT COLLABORATION",
    title: "Seeking a trusted partner in Spain",
    detail: "Residential property · Madrid and Marbella",
    name: "Daniel Moreau",
    initials: "DM",
    color: "#e8e0f5",
  },
  {
    type: "PROPERTY OPPORTUNITY",
    title: "Modern coastal homes in Marbella",
    detail: "New development · Costa del Sol, Spain",
    name: "Sofia Laurent",
    initials: "SL",
    color: "#f4e4d2",
  },
];

export default function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("Discover");
  const [search, setSearch] = useState("");
  const [opportunityType, setOpportunityType] = useState("All");
  const [postTitle, setPostTitle] = useState("");
const [postType, setPostType] = useState("BUYER REQUEST");
const [postDetails, setPostDetails] = useState("");
const [userOpportunities, setUserOpportunities] = useState<typeof opportunities>([]);
const [opportunitiesLoaded, setOpportunitiesLoaded] = useState(false);
const [postMessage, setPostMessage] = useState("");
const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [agentSearch, setAgentSearch] = useState("");
  type Agent = {
  id?: string;
  name: string;
  location: string;
  specialty: string;
  languages: string;
};

const [agents, setAgents] = useState<Agent[]>([]);
const [agentsLoaded, setAgentsLoaded] = useState(false);
const [agentsMessage, setAgentsMessage] = useState("");

useEffect(() => {
  let cancelled = false;

  async function loadAgents() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, location, headline, specialty")
      .order("created_at", { ascending: false });

    if (cancelled) return;

    if (error) {
      console.error("Could not load member profiles:", error.message);
      setAgentsMessage("Couldn't load member profiles. Showing examples.");
      setAgentsLoaded(true);
      return;
    }

    if (data && data.length > 0) {
      const realAgents = data
        .filter((profile) => profile.full_name?.trim())
       .map((profile) => ({
  id: profile.id,
  name: profile.full_name,
  location: profile.location || "Location not added",
  specialty: profile.specialty || profile.headline || "Real estate professional",
  languages: "Not specified",
}));

      if (realAgents.length > 0) {
        setAgents(realAgents);
      }
    }

    setAgentsLoaded(true);
  }

  loadAgents();

  return () => {
    cancelled = true;
  };
}, []);

  const [saved, setSaved] = useState<number[]>([]);
  const [savedTitles, setSavedTitles] = useState<string[]>([]);
  const [savedTitlesLoaded, setSavedTitlesLoaded] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connectedOpportunities, setConnectedOpportunities] = useState<string[]>([]);
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([]);
  const [communitiesLoaded, setCommunitiesLoaded] = useState(false);
  const [connectedAgents, setConnectedAgents] = useState<string[]>([]);
  const [pendingRequestIds, setPendingRequestIds] = useState<string[]>([]);
  const [acceptedConnections, setAcceptedConnections] = useState<
  { id: string; name: string; location: string; specialty: string }[]
>([]);
const [connectionsLoaded, setConnectionsLoaded] = useState(false);
const [incomingRequests, setIncomingRequests] = useState<
  { id: string; sender_id: string; status: string; created_at: string; sender_name?: string }[]
>([]);
const [requestsMessage, setRequestsMessage] = useState("");


useEffect(() => {
  let cancelled = false;

  async function refreshConnections() {
    await loadIncomingRequests();
    await loadAcceptedConnections();
    await loadOutgoingRequests();
  }

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(() => {
    if (!cancelled) {
      setIncomingRequests([]);
      setAcceptedConnections([]);
      setRequestsMessage("Please wait while connections load...");
      setConnectionsLoaded(false);
      refreshConnections();
    }
  });

  return () => {
    cancelled = true;
    subscription.unsubscribe();
  };
}, []);

useEffect(() => {
  let cancelled = false;

  async function checkLogin() {
    const { data } = await supabase.auth.getUser();

    if (!cancelled) {
      setIsLoggedIn(!!data.user);
    }
  }

  checkLogin();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setIsLoggedIn(!!session?.user);
  });

  return () => {
    cancelled = true;
    subscription.unsubscribe();
  };
}, []);

async function loadIncomingRequests() {
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) {
    setIncomingRequests([]);
    setRequestsMessage("Please sign in to view requests.");
    return;
  }

  const { data, error } = await supabase
    .from("connection_requests")
    .select("id, sender_id, status, created_at")
    .eq("receiver_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    setRequestsMessage("Couldn't load requests: " + error.message);
    return;
  }

  const requestsWithNames = await Promise.all(
    (data || []).map(async (request) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", request.sender_id)
        .maybeSingle();

      return {
        ...request,
        sender_name: profile?.full_name || "EstateConnect member",
      };
    })
  );

  setIncomingRequests(requestsWithNames);
  setRequestsMessage(
    requestsWithNames.length
      ? ""
      : "You don't have any pending requests yet."
  );
}
async function loadAcceptedConnections() {
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) {
    setAcceptedConnections([]);
    return;
  }

  const { data, error } = await supabase
    .from("connection_requests")
    .select("sender_id, receiver_id")
    .eq("status", "accepted")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

  if (error) {
    console.error("Could not load accepted connections:", error.message);
    return;
  }

  const otherUserIds = (data || []).map((request) =>
    request.sender_id === user.id
      ? request.receiver_id
      : request.sender_id
  );

  if (otherUserIds.length === 0) {
    setAcceptedConnections([]);
    return;
  }

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, location, headline, specialty")
    .in("id", otherUserIds);

  if (profileError) {
    console.error("Could not load connection profiles:", profileError.message);
    return;
  }

  setAcceptedConnections(
    (profiles || []).map((profile) => ({
      id: profile.id,
      name: profile.full_name || "EstateConnect member",
      location: profile.location || "Location not added",
      specialty: profile.specialty || profile.headline || "Real estate professional",
    }))
  );
}


async function loadOutgoingRequests() {
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) {
    setPendingRequestIds([]);
    return;
  }

  const { data, error } = await supabase
    .from("connection_requests")
    .select("receiver_id")
    .eq("sender_id", user.id)
    .eq("status", "pending");

  if (error) {
    console.error("Could not load outgoing requests:", error.message);
    return;
  }

  setPendingRequestIds(
    (data || []).map((request) => request.receiver_id)
  );
}

async function respondToRequest(
  requestId: string,
  decision: "accepted" | "declined"
) {
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) {
    setRequestsMessage("Please sign in to respond to requests.");
    return;
  }

  const { error } = await supabase
    .from("connection_requests")
    .update({ status: decision })
    .eq("id", requestId)
    .eq("receiver_id", user.id);

  if (error) {
    setRequestsMessage("Could not update request: " + error.message);
    return;
  }

  setIncomingRequests((previous) =>
    previous.filter((request) => request.id !== requestId)
  );
  setRequestsMessage(
    decision === "accepted"
      ? "Connection request accepted!"
      : "Connection request declined."
  );
}


async function sendConnectionRequest(receiverId: string) {
  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError || !authData.user) {
    alert("Please sign in before sending a connection request.");
    return;
  }

 
const { data: existingRequest, error: lookupError } = await supabase
  .from("connection_requests")
  .select("id, status")
  .eq("sender_id", authData.user.id)
  .eq("receiver_id", receiverId)
  .maybeSingle();

if (lookupError) {
  alert("Could not check existing request: " + lookupError.message);
  return;
}

if (existingRequest?.status === "pending") {
  alert("You already have a pending request for this agent.");
  return;
}

if (existingRequest?.status === "accepted") {
  alert("You are already connected with this agent.");
  return;
}

let error;

if (existingRequest?.status === "declined") {
  const result = await supabase
    .from("connection_requests")
    .update({ status: "pending", created_at: new Date().toISOString() })
    .eq("id", existingRequest.id);

  error = result.error;
} else {
  const result = await supabase
    .from("connection_requests")
    .insert({
      sender_id: authData.user.id,
      receiver_id: receiverId,
    });

  error = result.error;
}

  if (error) {
    alert(
      error.code === "23505"
        ? "You have already sent this connection request."
        : `Could not send request: ${error.message}`
    );
    return;
  }

  alert("Connection request sent successfully!");
}

  const [profileName, setProfileName] = useState("");
  const [profileLocation, setProfileLocation] = useState("");
  const [profileSpecialty, setProfileSpecialty] = useState("");
  const [profileHeadline, setProfileHeadline] = useState("");
  const [profileMessage, setProfileMessage] = useState("");

useEffect(() => {
  let cancelled = false;

  async function loadProfile() {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      if (!cancelled) {
        setProfileName(localStorage.getItem("estateconnect-name") || "");
        setProfileLocation(localStorage.getItem("estateconnect-location") || "");
        setProfileSpecialty(localStorage.getItem("estateconnect-specialty") || "");
        setProfileHeadline(localStorage.getItem("estateconnect-headline") || "");
      }
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, location, headline, specialty")
      .eq("id", user.id)
      .maybeSingle();

    if (cancelled) return;

    if (error) {
      console.error("Could not load profile:", error.message);
      return;
    }

    if (data) {
      setProfileName(data.full_name || "");
      setProfileLocation(data.location || "");
      setProfileHeadline(data.headline || "");
      setProfileSpecialty(data.specialty || "");
    }
  }

  loadProfile();

  return () => {
    cancelled = true;
  };
}, []);


useEffect(() => {
  const timer = setTimeout(() => {
    localStorage.setItem("estateconnect-name", profileName);
    localStorage.setItem("estateconnect-location", profileLocation);
    localStorage.setItem("estateconnect-specialty", profileSpecialty);
    localStorage.setItem("estateconnect-headline", profileHeadline);
  }, 500);

  return () => clearTimeout(timer);
}, [profileName, profileLocation, profileSpecialty, profileHeadline]);
useEffect(() => {
  // Your existing profile-saving code
}, [profileName, profileLocation, profileSpecialty, profileHeadline]);

useEffect(() => {
  const savedConnections = localStorage.getItem("estateconnect-connections");
  if (savedConnections) {
    setConnectedAgents(JSON.parse(savedConnections));
  }
  setConnectionsLoaded(true);
}, []);


useEffect(() => {
  setConnectedAgents([]);
  setConnectionsLoaded(true);
}, []);

useEffect(() => {
  setUserOpportunities([]);
  localStorage.removeItem("estateconnect-opportunities");
  setOpportunitiesLoaded(true);
}, []);

useEffect(() => {
  if (opportunitiesLoaded) {
    localStorage.setItem(
      "estateconnect-opportunities",
      JSON.stringify(userOpportunities)
    );
  }
}, [userOpportunities, opportunitiesLoaded]);


useEffect(() => {
  try {
    const savedItems = localStorage.getItem("estateconnect-saved-opportunities");
    if (savedItems) {
      setSavedTitles(JSON.parse(savedItems));
    }
  } catch {
    setSavedTitles([]);
  } finally {
    setSavedTitlesLoaded(true);
  }
}, []);

useEffect(() => {
  if (savedTitlesLoaded) {
    localStorage.setItem(
      "estateconnect-saved-opportunities",
      JSON.stringify(savedTitles)
    );
  }
}, [savedTitles, savedTitlesLoaded]);


useEffect(() => {
  try {
    const savedCommunities = localStorage.getItem("estateconnect-communities");
    if (savedCommunities) {
      setJoinedCommunities(JSON.parse(savedCommunities));
    }
  } catch {
    setJoinedCommunities([]);
  } finally {
    setCommunitiesLoaded(true);
  }
}, []);

useEffect(() => {
  if (communitiesLoaded) {
    localStorage.setItem(
      "estateconnect-communities",
      JSON.stringify(joinedCommunities)
    );
  }
}, [joinedCommunities, communitiesLoaded]);

const allOpportunities = [...userOpportunities, ...opportunities];

const filtered = allOpportunities.filter((item) => {
  const matchesSearch = `${item.title} ${item.detail} ${item.name} ${item.type}`
    .toLowerCase()
    .includes(search.toLowerCase());

  const matchesType =
    opportunityType === "All" || item.type === opportunityType;

  return matchesSearch && matchesType;
});

  
const filteredAgents = agents.filter((agent) =>
  `${agent.name} ${agent.location} ${agent.specialty} `
    .toLowerCase()
    .includes(agentSearch.toLowerCase())
);


  return (
    <>
    {isPostModalOpen && (
  <div className="w-full max-w-xl rounded-3xl border border-[#e5e1d8] bg-white p-6 shadow-2xl">
    <div className="w-full max-w-xl rounded-3xl border border-[#e5e1d8] bg-[#fbfaf7] p-6 shadow-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Create an opportunity</h2>
          <p className="mt-1 text-sm text-gray-500">
            Share your next business opportunity.
          </p>
        </div>
        <button
          onClick={() => setIsPostModalOpen(false)}
          className="rounded-full px-3 py-2 text-gray-500 hover:bg-gray-200"
          aria-label="Close pop-up"
        >
          ✕
        </button>
      </div>

     
    </div>
  </div>
)}
    <main className="min-h-screen bg-[#fbfaf7] text-[#202a24]">
      <header className="sticky top-0 z-20 border-b border-[#e5e1d8] bg-[#fbfaf7]/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <button
            onClick={() => setActiveTab("Discover")}
            className="flex items-center gap-3 text-left"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#174b38] text-xl font-bold text-white">
              E
            </span>
            <span>
              <span className="block text-lg font-bold tracking-tight">
                EstateConnect
              </span>
              <span className="block text-xs text-gray-500">
                Your world of real estate
              </span>
            </span>
          </button>

          <nav className="hidden items-center gap-2 rounded-2xl bg-[#f1efe8] p-1.5 md:flex">
            {["Discover", "My Network", "Opportunities", "Communities", "Profile"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm ${
                    activeTab === tab
                      ? "font-semibold text-[#174b38]"
                      : "text-gray-500 hover:text-[#174b38]"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </nav>

         

{!isLoggedIn && (
  <button
    onClick={() => window.location.href = "/signup"}
    className="rounded-full bg-[#174b38] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#103b2b]"
  >
    Join the network
  </button>
)}


        </div>
      </header>

      
{activeTab === "Discover" && (
 <section className="grid min-h-[calc(100vh-80px)] w-full items-center gap-8 px-6 py-10 md:px-10 lg:grid-cols-2 lg:gap-12 lg:px-16 lg:py-12">    <div className="flex flex-col justify-center">

          <div className="mb-5 flex items-center gap-2 text-sm font-medium text-[#47745b]">
            <span className="h-2 w-2 rounded-full bg-[#6b9c72]" />
            A global network for real estate professionals
          </div>

          <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Your next great
            <span className="text-[#47745b]"> connection </span>
            could be anywhere.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
            Meet trusted agents, discover property opportunities, and build
            relationships that take your real estate business further.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab("Opportunities")}
              className="rounded-xl bg-[#174b38] px-6 py-3 font-medium text-white hover:bg-[#103b2b]"
            >
              Explore opportunities →
            </button>
            <button
              onClick={() => setActiveTab("My Network")}
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-medium hover:border-[#174b38]"
            >
              Build your network
            </button>
          </div>

          <div className="mt-10 flex flex-wrap gap-8 border-t border-gray-200 pt-6">
            <div>
              <p className="text-2xl font-semibold">Global</p>
              <p className="mt-1 text-sm text-gray-500">Connections</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">Cross-border</p>
              <p className="mt-1 text-sm text-gray-500">Opportunities</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">Trust first</p>
              <p className="mt-1 text-sm text-gray-500">Relationships</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-[#e8eee8] p-5 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">YOUR NETWORK, CONNECTED</p>
              <h2 className="mt-1 text-2xl font-semibold">
                Opportunities worldwide
              </h2>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#47745b]">
              Preview
            </span>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white p-5">
              <p className="text-3xl">🏙️</p>
              <p className="mt-4 font-semibold">Dubai</p>
              <p className="text-sm text-gray-500">Buyers & investment</p>
            </div>
            <div className="rounded-2xl bg-white p-5">
              <p className="text-3xl">🌊</p>
              <p className="mt-4 font-semibold">Spain</p>
              <p className="text-sm text-gray-500">Homes & partnerships</p>
            </div>
            <div className="col-span-2 rounded-2xl bg-[#174b38] p-5 text-white">
              <p className="text-sm text-white/70">THE POWER OF CONNECTION</p>
              <p className="mt-2 text-xl font-medium">
                One trusted introduction can open a whole new market.
              </p>
              <p className="mt-3 text-sm text-white/70">
                Built for relationships, referrals, and international growth.
              </p>
            </div>
          </div>
        </div>
      </section>
      )}

 
{activeTab !== "Discover" && (
  
<section className="flex min-h-[calc(100vh-156px)] w-full flex-col px-6 py-4 md:px-10 lg:px-16">

    <p className="text-sm font-semibold uppercase tracking-widest text-[#47745b]">
      EstateConnect workspace
    </p>
    <h2 className="mt-2 text-3xl font-semibold">{activeTab}</h2>

    {activeTab === "My Network" && (
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
        
<h3 className="text-2xl font-semibold tracking-tight text-[#174b38]">
  Build your professional network
</h3>

<div className="mt-5 grid gap-4 sm:grid-cols-2">
  <div className="rounded-2xl border border-[#e5e1d8] bg-white p-5 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf3ed] text-[#174b38]">
        <span className="text-xl">👥</span>
      </div>
      <div>
        <p className="text-2xl font-semibold text-[#174b38]">
          {acceptedConnections.length}
        </p>
        <p className="text-sm text-gray-500">Accepted connections</p>
      </div>
    </div>
  </div>

  <div className="rounded-2xl border border-[#e5e1d8] bg-white p-5 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf3ed] text-[#174b38]">
        <span className="text-xl">✉️</span>
      </div>
      <div>
        <p className="text-2xl font-semibold text-[#174b38]">
          {incomingRequests.length}
        </p>
        <p className="text-sm text-gray-500">Pending requests</p>
      </div>
    </div>
  </div>
</div>

<p className="mt-2 text-sm leading-6 text-gray-500">
  Connect with trusted real estate professionals, grow your relationships,
  and discover new opportunities across markets.
</p>

        
<div className="mt-6 rounded-2xl border border-[#e5e1d8] bg-[#f7f6f1] p-5 shadow-sm"
>
  <h4 className="font-semibold">Incoming connection requests</h4>

  {requestsMessage && (
    <p className="mt-2 text-sm text-gray-600">
      {requestsMessage}
    </p>
  )}

  {incomingRequests.map((request) => (
    <div
      key={request.id}
      
className="mt-3 rounded-xl border border-[#e5e1d8] bg-white p-4 shadow-sm transition hover:shadow-md"

    >
      <p className="text-sm font-medium">
        Connection request received
      </p>
      <p className="mt-1 text-xs text-gray-500">
        From: {request.sender_name}
      </p>

      <p className="mt-1 text-xs text-gray-500">
        Status: {request.status}
      </p>
      
{request.status === "pending" && (
  <div className="mt-3 flex gap-2">
    <button
      onClick={() => respondToRequest(request.id, "accepted")}
      className="rounded-lg bg-[#174b38] px-3 py-2 text-sm text-white"
    >
      Accept
    </button>

    <button
      onClick={() => respondToRequest(request.id, "declined")}
      className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
    >
      Decline
    </button>
  </div>
)}

    </div>
  ))}
</div>

     <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
  <h3 className="text-xl font-semibold">My accepted connections</h3>

  {acceptedConnections.length === 0 ? (
    <p className="mt-2 text-sm text-gray-600">
      No accepted connections yet.
    </p>
  ) : (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      {acceptedConnections.map((connection) => (
        <div
          key={connection.id}
         
className="rounded-2xl border border-[#e5e1d8] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#b9cdbd] hover:shadow-md"

        >
          <h4 className="font-semibold">{connection.name}</h4>
          <p className="mt-1 text-sm text-gray-600">
            {connection.location}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {connection.specialty}
          </p>
        </div>
      ))}
    </div>
  )}
</div>
     
        <input
  value={agentSearch}
  onChange={(event) => setAgentSearch(event.target.value)}
  placeholder="Search agents by name, location, or specialty..."
 
className="mt-5 w-full rounded-2xl border border-[#e5e1d8] bg-white px-4 py-3.5 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus:border-[#47745b] focus:ring-2 focus:ring-[#47745b]/15"

/>
        <p className="mt-2 text-gray-600">
          Connect with real estate professionals, build trusted relationships,
          and explore future partnerships.
        </p>
       
<div className="mt-6 grid gap-4 md:grid-cols-2">
  {filteredAgents.map((agent) => (
    <div
      key={agent.name}
      
className="rounded-2xl border border-[#e5e1d8] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#b9cdbd] hover:shadow-md"

    >
      <h4 className="text-lg font-semibold">{agent.name}</h4>
      <p className="mt-1 text-sm text-gray-500">{agent.location}</p>
      <p className="mt-3 text-sm">{agent.specialty}</p>
      <p className="mt-1 text-sm text-gray-500">
        Languages: {agent.languages}
      </p>
     
<button

onClick={async () => {
  if (!agent.id) {
    alert("This example agent doesn't have a real account yet.");
    return;
  }

  await sendConnectionRequest(agent.id);
}}

  
className="mt-4 w-full rounded-xl bg-[#174b38] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#103b2b] focus:outline-none focus:ring-2 focus:ring-[#47745b] focus:ring-offset-2"

>
  
{acceptedConnections.some((connection) => connection.id === agent.id)
  ? "Connected ✓"
  : pendingRequestIds.includes(agent.id || "")
    ? "Request pending ✓"
    : "Connect"}

</button>

    </div>
  ))}
</div>

      </div>
    )}

    
{activeTab === "Profile" && (
  <div className="mt-6 w-full rounded-3xl border border-[#e5e1d8] bg-white p-6 shadow-sm md:p-8 lg:p-10">
    <h3 className="text-2xl font-semibold tracking-tight text-[#174b38]">
  Your professional profile
</h3>
    <p className="mt-2 text-gray-600">
      Introduce yourself to the EstateConnect network.
    </p>

    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-medium">
        Full name
        <input
          value={profileName}
          onChange={(event) => setProfileName(event.target.value)}
          placeholder="Your full name"
          className="mt-2 w-full rounded-xl border border-gray-300 p-3"
        />
      </label>

      <label className="text-sm font-medium">
        City or country
        <input
          value={profileLocation}
          onChange={(event) => setProfileLocation(event.target.value)}
          placeholder="e.g. Dubai, UAE"
          className="mt-2 w-full rounded-xl border border-gray-300 p-3"
        />
      </label>

     <label className="text-sm font-medium sm:col-span-2">
  Professional headline
  <input
    value={profileHeadline}
    onChange={(event) => setProfileHeadline(event.target.value)}
    placeholder="e.g. Helping international buyers find homes in Dubai"
    className="mt-2 w-full rounded-xl border border-gray-300 p-3"
  />
</label>
    </div>

    <div className="mt-6 rounded-xl bg-[#edf3ed] p-4">
      <p className="font-semibold">Profile preview</p>
      <p className="mt-2">{profileName || "Your name will appear here"}</p>
      <p className="text-sm text-gray-600">
        {profileLocation || "Your location"}
      </p>
      <p>{profileHeadline || "Your professional headline"}</p>
     
    </div>
    

<button
  onClick={async () => {
    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    const user = authData.user;

    if (authError || !user) {
      setProfileMessage("Please sign in before saving your profile.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          full_name: profileName.trim(),
          location: profileLocation.trim(),
          headline: profileHeadline.trim(),
          specialty: profileSpecialty.trim(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (error) {
      console.error("Profile save failed:", error.message);
      setProfileMessage(`Profile could not be saved: ${error.message}`);
      return;
    }

    localStorage.setItem("estateconnect-name", profileName);
    localStorage.setItem("estateconnect-location", profileLocation);
    localStorage.setItem("estateconnect-specialty", profileSpecialty);
    localStorage.setItem("estateconnect-headline", profileHeadline);

    setProfileMessage("Your profile was saved successfully!");
  }}
  className="mt-5 rounded-xl bg-[#174b38] px-6 py-3 font-medium text-white hover:bg-[#103b2b]"
>
  Save Profile
</button>
{profileMessage && (
  <p className="mt-3 text-sm text-[#47745b]" role="status">
    {profileMessage}
  </p>
)}  
  </div>
)}


    {activeTab === "Opportunities" && (
  <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
    <h3 className="text-xl font-semibold">Discover opportunities</h3>
    <p className="mt-2 text-gray-600">
      Find buyer requests, property opportunities, and agent collaborations.
      Explore the opportunity board below.
    </p>
  </div>
)}
{activeTab === "Communities" && (
      <div className="mt-6 w-full flex-1 rounded-2xl border border-[#e5e1d8] bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold">Professional communities</h3>
        <p className="mt-2 text-gray-600">
          Join conversations with real estate professionals in different
          markets and specialties.
        </p>
        
<div className="mt-5 grid w-full gap-5 md:grid-cols-2 xl:grid-cols-3">
  {
[
  {
    name: "Dubai Property Professionals",
    description: "Connect with agents and property experts working in Dubai.",
  },
  {
    name: "Spain Real Estate Network",
    description: "Meet professionals focused on Marbella, Madrid, and beyond.",
  },
  {
    name: "International Property Investors",
    description: "Discuss cross-border investment opportunities.",
  },
  {
    name: "Luxury Property Specialists",
    description: "Share luxury listings, buyer referrals, and high-end market insights.",
  },
  {
    name: "Real Estate Marketing & Branding",
    description: "Exchange digital marketing ideas, listing strategies, and brand-building tips.",
  },
  {
    name: "Property Developers & New Builds",
    description: "Connect with developers and agents working on new residential projects.",
  },
  {
    name: "Global Buyer Referral Network",
    description: "Build trusted referral partnerships for international property buyers.",
  },
  {
    name: "Commercial Real Estate Professionals",
    description: "Discuss office, retail, industrial, and commercial investment opportunities.",
  },
  {
    name: "First-Time Buyer Advisors",
    description: "Share guidance and resources for helping buyers purchase their first property.",
  },

  ].map((community) => (
    <div
      key={community.name}
      className="rounded-xl border border-gray-200 p-5"
    >
      <h4 className="font-semibold">{community.name}</h4>
      <p className="mt-2 text-sm text-gray-600">{community.description}</p>
     
<button
  onClick={() =>
    setJoinedCommunities((previous) =>
      previous.includes(community.name)
        ? previous.filter((name) => name !== community.name)
        : [...previous, community.name]
    )
  }
  className="mt-4 rounded-lg bg-[#174b38] px-4 py-2 text-sm text-white"
>
  {joinedCommunities.includes(community.name) ? "Joined ✓" : "Join community"}
</button>

    </div>
  ))}
</div>

      </div>
    )}
  </section>
)}
{activeTab === "Opportunities" && (
      <section className="mx-auto w-full px-6 pb-10 pt-2 md:px-10 lg:px-16">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-[#47745b]">
              The opportunity board
            </p>
            <h2 className="mt-2 text-3xl font-semibold">
              Find your next connection
            </h2>
            <p className="mt-2 text-gray-500">
              Explore sample buyer requests, partnerships, and properties.
            </p>
          </div>
<button
  onClick={() => setIsPostModalOpen(true)}
  className="rounded-xl bg-[#174b38] px-5 py-3 font-medium text-white shadow-sm transition hover:bg-[#103b2b]"
>
  + Post an opportunity
</button>


{isPostModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
   <div className="w-full max-w-xl rounded-3xl border border-[#e5e1d8] bg-white p-6 shadow-2xl">
  <h3 className="text-xl font-semibold">Post an opportunity</h3>
  <p className="mt-1 text-sm text-gray-500">
    Share an opportunity with your professional network.
  </p>

  <div className="mt-4 grid gap-4">
    <label className="text-sm font-medium">
      Opportunity type
      <select
        value={postType}
        onChange={(event) => setPostType(event.target.value)}
        className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3"
      >
        <option value="BUYER REQUEST">Buyer request</option>
        <option value="AGENT COLLABORATION">Agent collaboration</option>
        <option value="PROPERTY OPPORTUNITY">Property opportunity</option>
      </select>
    </label>

    <label className="text-sm font-medium">
      Title
      <input
        value={postTitle}
        onChange={(event) => setPostTitle(event.target.value)}
        placeholder="e.g. Buyer looking for a home in Dubai"
        className="mt-2 w-full rounded-xl border border-gray-300 p-3"
      />
    </label>

    <label className="text-sm font-medium">
      Details
      <textarea
        value={postDetails}
        onChange={(event) => setPostDetails(event.target.value)}
        placeholder="Add the location, budget, or collaboration details"
        rows={3}
        className="mt-2 w-full rounded-xl border border-gray-300 p-3"
      />
    </label>

    
<button
  onClick={() => {
    if (!postTitle.trim() || !postDetails.trim()) {
      setPostMessage("Please enter a title and details.");
      return;
    }

    setUserOpportunities((previous) => [
      {
        type: postType,
        title: postTitle.trim(),
        detail: postDetails.trim(),
        name: profileName || "EstateConnect member",
        initials: (profileName || "EC")
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        color: "#dce9df",
      },
      ...previous,
    ]);

    setPostTitle("");
    setPostDetails("");
    setPostMessage("Your opportunity was added to the board.");
    setIsPostModalOpen(false);
}}
  className="rounded-xl bg-[#174b38] px-5 py-3 font-medium text-white"
>
  Publish opportunity
</button>
{postMessage && (
  <p className="text-sm text-[#47745b]" role="status">
    {postMessage}
  </p>
)}

   </div>
   </div>
</div>
)}


          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search opportunities..."
            aria-label="Search opportunities"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#47745b] sm:max-w-xs"
          />
        </div>


<div className="mt-5 flex flex-wrap gap-2">
  {["All", "BUYER REQUEST", "AGENT COLLABORATION", "PROPERTY OPPORTUNITY"].map(
    (type) => (
      <button
        key={type}
        onClick={() => setOpportunityType(type)}
        className={`rounded-full border px-4 py-2 text-sm ${
          opportunityType === type
            ? "border-[#174b38] bg-[#174b38] text-white"
            : "border-gray-300 bg-white text-gray-600"
        }`}
      >
        {type === "All" ? "All opportunities" : type}
      </button>
    )
  )}
</div>

        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const originalIndex = opportunities.indexOf(item);

            return (
              <article
                key={item.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[#edf3ed] px-3 py-1 text-xs font-semibold text-[#47745b]">
                    {item.type}
                  </span>
                  <button
                    onClick={() =>
  setSavedTitles((previous) =>
    previous.includes(item.title)
      ? previous.filter((title) => title !== item.title)
      : [...previous, item.title]
  )
}
                    aria-label="Save opportunity"
                    className="text-xl text-gray-500 hover:text-[#174b38]"
                  >
                    {savedTitles.includes(item.title) ? "♥" : "♡"}
                  </button>
                </div>

                <h3 className="mt-5 text-xl font-semibold leading-snug">
                  {item.title}
                </h3>
                <p className="mt-3 min-h-12 text-sm leading-6 text-gray-500">
                  {item.detail}
                </p>

                <div className="mt-5 flex items-center gap-3 border-t border-gray-100 pt-4">
                  <span
                    style={{ backgroundColor: item.color }}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold"
                  >
                    {item.initials}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      Example network member
                    </p>
                  </div>
                </div>
                
<button
  onClick={() =>
    setConnectedOpportunities((previous) =>
      previous.includes(item.title)
        ? previous
        : [...previous, item.title]
    )
  }
  className="mt-5 w-full rounded-xl border border-[#174b38] px-4 py-2.5 text-sm font-medium text-[#174b38] hover:bg-[#edf3ed]"
>
  {connectedOpportunities.includes(item.title)
    ? "Connection interest noted ✓"
    : "Connect"}
</button>

              </article>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="mt-8 rounded-xl bg-white p-8 text-center text-gray-500">
            No matching opportunities. Try another search.
          </p>
        )}

        <p className="mt-6 text-xs text-gray-400">
          Demo content only. These people and opportunities are examples, not
          verified listings or real network members.
        </p>
      </section>
 )}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-7 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-[#174b38]">EstateConnect</p>
          <p>Building a more connected real estate world.</p>
        </div>
      </footer>
    </main>
    </>
  );
}