import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Copy, ExternalLink, FileText, Play } from "lucide-react";
import toast from "react-hot-toast";


interface APIEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
  parameters: Parameter[];
  responses: Response[];
  rateLimit: number;
  authentication: boolean;
}

interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example: string;
}

interface Response {
  code: number;
  description: string;
  schema: object;
  example: object;
}

const mockEndpoints: APIEndpoint[] = [
  {
    path: "/api/v1/integrations",
    method: "GET",
    description: "Retrieve all active integrations",
    parameters: [
      {
        name: "type",
        type: "string",
        required: false,
        description: "Filter by integration type",
        example: "payment"
      },
      {
        name: "status",
        type: "string", 
        required: false,
        description: "Filter by status",
        example: "active"
      }
    ],
    responses: [
      {
        code: 200,
        description: "Success",
        schema: {},
        example: {
          integrations: [
            {
              id: "stripe_1",
              name: "Stripe",
              type: "payment",
              status: "active"
            }
          ]
        }
      }
    ],
    rateLimit: 1000,
    authentication: true
  },
  {
    path: "/api/v1/integrations/{id}/sync",
    method: "POST", 
    description: "Trigger manual sync for integration",
    parameters: [
      {
        name: "id",
        type: "string",
        required: true,
        description: "Integration ID",
        example: "stripe_1"
      }
    ],
    responses: [
      {
        code: 200,
        description: "Sync initiated",
        schema: {},
        example: {
          message: "Sync initiated successfully",
          syncId: "sync_123"
        }
      }
    ],
    rateLimit: 100,
    authentication: true
  }
];

const methodColors = {
  GET: "secondary",
  POST: "default",
  PUT: "outline", 
  DELETE: "destructive"
} as const;

export function APIDocumentation() {

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code snippet has been copied to clipboard.")
  };

  const generateCurlExample = (endpoint: APIEndpoint) => {
    const authHeader = endpoint.authentication ? `-H "Authorization: Bearer YOUR_API_KEY" \\` : '';
    const method = endpoint.method !== 'GET' ? `-X ${endpoint.method} \\` : '';
    
    return `curl ${method}
  ${authHeader}
  -H "Content-Type: application/json" \\
  https://api.mesachain.com${endpoint.path}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          API Documentation
        </CardTitle>
        <CardDescription>
          Interactive documentation for MesaChain API endpoints
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="space-y-6">
            {mockEndpoints.map((endpoint, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={methodColors[endpoint.method]}>
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {endpoint.path}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    {endpoint.authentication && (
                      <Badge variant="outline">🔒 Auth Required</Badge>
                    )}
                    <Badge variant="secondary">{endpoint.rateLimit}/hr</Badge>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {endpoint.description}
                </p>

                <Tabs defaultValue="parameters" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="parameters">Parameters</TabsTrigger>
                    <TabsTrigger value="responses">Responses</TabsTrigger>
                    <TabsTrigger value="examples">Examples</TabsTrigger>
                    <TabsTrigger value="test">Test</TabsTrigger>
                  </TabsList>

                  <TabsContent value="parameters" className="space-y-2">
                    {endpoint.parameters.length > 0 ? (
                      endpoint.parameters.map((param, i) => (
                        <div key={i} className="border rounded p-3 text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="font-mono text-xs bg-muted px-1 rounded">
                              {param.name}
                            </code>
                            <Badge variant="outline" className="text-xs">
                              {param.type}
                            </Badge>
                            {param.required && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-1">
                            {param.description}
                          </p>
                          <code className="text-xs text-muted-foreground">
                            Example: {param.example}
                          </code>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">No parameters required</p>
                    )}
                  </TabsContent>

                  <TabsContent value="responses" className="space-y-2">
                    {endpoint.responses.map((response, i) => (
                      <div key={i} className="border rounded p-3 text-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={response.code === 200 ? "secondary" : "destructive"}>
                            {response.code}
                          </Badge>
                          <span>{response.description}</span>
                        </div>
                        <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                          {JSON.stringify(response.example, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="examples" className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">cURL</h4>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyCode(generateCurlExample(endpoint))}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                        {generateCurlExample(endpoint)}
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="test" className="space-y-3">
                    <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-lg">
                      <div className="text-center space-y-3">
                        <Play className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Interactive API testing coming soon
                        </p>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Open in Postman
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}