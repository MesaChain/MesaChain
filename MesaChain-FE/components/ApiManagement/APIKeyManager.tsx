import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Eye, EyeOff, Plus, Trash2, Calendar } from "lucide-react";
import toast from "react-hot-toast";


interface APIKey {
    id: string;
    name: string;
    key: string;
    permissions: string[];
    createdAt: Date;
    lastUsed?: Date;
    isActive: boolean;
}

const mockAPIKeys: APIKey[] = [
    {
        id: "1",
        name: "Production API Key",
        key: "mk_live_1234567890abcdef",
        permissions: ["read", "write"],
        createdAt: new Date("2024-01-15"),
        lastUsed: new Date("2024-01-20"),
        isActive: true
    },
    {
        id: "2",
        name: "Development API Key",
        key: "mk_test_abcdef1234567890",
        permissions: ["read"],
        createdAt: new Date("2024-01-10"),
        lastUsed: new Date("2024-01-19"),
        isActive: true
    }
];

export function APIKeyManager() {
    const [apiKeys, setAPIKeys] = useState<APIKey[]>(mockAPIKeys);
    const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
    const [newKeyName, setNewKeyName] = useState("");

    const copyToClipboard = async (key: string) => {
        await navigator.clipboard.writeText(key);
        toast.success("API Key copied");
    };

    const toggleKeyVisibility = (keyId: string) => {
        setShowKeys(prev => ({
            ...prev,
            [keyId]: !prev[keyId]
        }));
    };

    const generateNewKey = () => {
        if (!newKeyName.trim()) return;

        const newKey: APIKey = {
            id: Date.now().toString(),
            name: newKeyName,
            key: `mk_${Math.random().toString(36).substr(2, 20)}`,
            permissions: ["read"],
            createdAt: new Date(),
            isActive: true
        };

        setAPIKeys(prev => [...prev, newKey]);
        setNewKeyName("");
        toast.success(`API Key generated : "${newKeyName}"`);
    };

    const revokeKey = (keyId: string) => {
        setAPIKeys(prev => prev.filter(key => key.id !== keyId));
        toast.error("The API key has been permanently revoked.");
    };

    const maskKey = (key: string) => {
        return key.slice(0, 12) + "••••••••" + key.slice(-4);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>API Key Management</CardTitle>
                <CardDescription>
                    Manage your API keys for third-party integrations
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Generate New Key */}
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Label htmlFor="keyName">New API Key Name</Label>
                        <Input
                            id="keyName"
                            placeholder="e.g., Production Key"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={generateNewKey}
                        className="mt-6"
                        variant="secondary"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Generate Key
                    </Button>
                </div>

                {/* Existing Keys */}
                <div className="space-y-3">
                    {apiKeys.map((key) => (
                        <div key={key.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">{key.name}</h4>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        Created {key.createdAt.toLocaleDateString()}
                                        {key.lastUsed && (
                                            <span>• Last used {key.lastUsed.toLocaleDateString()}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {key.permissions.map(permission => (
                                        <Badge key={permission} variant="secondary">
                                            {permission}
                                        </Badge>
                                    ))}
                                    <Badge variant={key.isActive ? "default" : "destructive"} className={`${key.isActive ? "bg-green-500" : "bg-red-400"}`}>
                                        {key.isActive ? "Active" : "Revoked"}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                                    {showKeys[key.id] ? key.key : maskKey(key.key)}
                                </code>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => toggleKeyVisibility(key.id)}
                                >
                                    {showKeys[key.id] ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(key.key)}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => revokeKey(key.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}