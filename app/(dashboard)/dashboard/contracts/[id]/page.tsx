// Remove "use client" - Fetch data server-side

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react"; // Removed unused icons for now
import { createClient } from "@/utils/supabase/server"; // Use server client
import { redirect } from "next/navigation";
import { notFound } from 'next/navigation'; // Use Next.js notFound
import { Database } from "@/types/supabase"; // Import generated types
import { ContractDetailClientActions } from "@/components/dashboard/contract-detail-client-actions"; // Client component for actions
import TiptapEditor from '@/components/editor/tiptap-editor'; // Import the Tiptap editor

// Define and EXPORT the type for the fetched contract
export type ContractDetail = Database['public']['Tables']['contracts']['Row'] & {
  contract_templates: Pick<Database['public']['Tables']['contract_templates']['Row'], 'name'> | null;
  // TODO: Add contract_parties join later
  // contract_parties: Array<Database['public']['Tables']['contract_parties']['Row'] & { profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'display_name' | 'email'> | null }> | null; // Example join
};

// Define status type more broadly based on schema
type ContractStatus = 'draft' | 'pending' | 'signed' | 'completed' | 'cancelled' | 'disputed';


// Fetch data server-side
export default async function ContractDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const {
    data: { user },
    error: getUserError,
  } = await supabase.auth.getUser();

  if (getUserError || !user) {
    console.error("Contract Detail Error: User not found.", getUserError);
    return redirect("/sign-in");
  }

  // Fetch the specific contract by ID, ensuring it belongs to the user
  const { data: contract, error: fetchError } = await supabase
    .from("contracts")
    .select(`
      *,
      contract_templates ( name )
    `)
    .eq("id", params.id)
    .eq("creator_id", user.id)
    .maybeSingle();

  if (fetchError) {
    console.error(`Error fetching contract ${params.id}:`, fetchError);
    notFound();
  }

  if (!contract) {
    notFound(); // Trigger Next.js 404 page
  }

  // Access is already controlled by the query filter above (creator_id = user.id)
  // If we reach here, the user has proper access to view this contract


  // Cast to the specific type for easier access
  const contractDetail = contract as ContractDetail;

  // Default content structure if contract.content is null/invalid
  const editorContent = contractDetail.content || { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Contract content is empty or invalid." }] }] };

  // Dummy function for read-only editor - required by the component prop
  const handleContentChangeDummy = (content: any) => {
    // Do nothing in read-only mode
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline" className="bg-muted text-muted-foreground">Draft</Badge>;
      case "pending":
         return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200">Pending</Badge>;
      case "signed":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-200">Signed</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-500/20 text-green-600 border-green-300">Completed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-200">Cancelled</Badge>;
      case "disputed":
        return <Badge variant="destructive">Disputed</Badge>;
      default:
        return <Badge variant="outline">{status ?? 'Unknown'}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <Link href="/dashboard/contracts" className="flex items-center text-sm text-muted-foreground mb-2 hover:underline">
            <ArrowLeftIcon className="h-3 w-3 mr-1" />
            Back to contracts
          </Link>
          <h1 className="text-3xl font-serif font-bold">{contractDetail.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            {getStatusBadge(contractDetail.status)}
            <span className="text-sm text-muted-foreground">
              Created on {contractDetail.created_at ? new Date(contractDetail.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>

        {/* Client Actions Component - This will handle action visibility based on user role/status */}
        <ContractDetailClientActions contract={contractDetail} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contract Details Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contract Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                  <p>{contractDetail.description || "No description provided."}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Payment Details</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">
                      {contractDetail.total_amount ? `${contractDetail.currency || 'USD'} ${Number(contractDetail.total_amount).toFixed(2)}` : "Not specified"}
                    </span>
                    {/* Add payment type display if needed */}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Contract Template</h3>
                  <p>{contractDetail.contract_templates?.name ?? 'Custom Contract'}</p>
                </div>

                <Separator />

                {/* Render actual contract content using TiptapEditor */}
                <div>
                   <h3 className="text-sm font-medium text-muted-foreground mb-2">Contract Content</h3>
                   {/* Use the TiptapEditor component in read-only mode */}
                    <TiptapEditor
                     initialContent={editorContent}
                     // No onContentChange needed for read-only
                     editable={false} // Set to read-only
                   />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* TODO: Fetch and display client info from contract_parties table */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Client Info (Placeholder)</h3>
                  <p className="text-xs text-muted-foreground">Fetch client details from contract_parties table.</p>
                  {/* Example: Display client name/email if fetched */}
                  {/* {contractDetail.contract_parties?.find(p => p.role === 'client')?.profiles?.display_name || 'Client details pending'} */}
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Contract Status</h3>
                  <div className="flex items-center mt-1">
                    {getStatusBadge(contractDetail.status)}
                  </div>
                </div>
                {/* Actions are handled by the Client Component */}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Payment tracking is available on Professional and Business plans.
                </p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link href="/dashboard/subscription">
                    Upgrade Plan
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
