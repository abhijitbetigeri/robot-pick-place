"""
The Living Map: Topological Road and Bridge Graph for Mission Creek, SF.
Scaled to metric units in Isaac Sim.
"""

# Metric 3D coordinates on the real Mission Creek bridge crossing
WAYPOINTS = {
    # South Bank (Starting staging area)
    "South_Depot": (0.0, -30.0, 0.0),
    "Fork_Decision_Point": (0.0, -10.0, 0.0),
    
    # Bridge Alpha (Primary - 4th Street Bridge)
    "Bridge_Alpha_Entry": (-15.0, 0.0, 0.5),   # Obstacle spawns here
    "Bridge_Alpha_Mid": (-15.0, 12.0, 0.5),
    "Bridge_Alpha_Exit": (-15.0, 25.0, 0.5),
    
    # Bridge Beta (Detour - 3rd Street Bridge)
    "Detour_Approach": (25.0, -10.0, 0.0),
    "Bridge_Beta_Entry": (25.0, 0.0, 0.5),
    "Bridge_Beta_Mid": (25.0, 12.0, 0.5),
    "Bridge_Beta_Exit": (25.0, 25.0, 0.5),
    
    # North Bank (Final Delivery Destination)
    "North_Approach": (0.0, 28.0, 0.0),
    "North_Goal": (0.0, 38.0, 0.0),
}

# Base Edge definitions with distance weights (in meters)
EDGES = {
    # Approach to the river fork
    ("South_Depot", "Fork_Decision_Point"): 20.0,
    
    # Route A: Via Bridge Alpha (Primary Short Route: ~75m total)
    ("Fork_Decision_Point", "Bridge_Alpha_Entry"): 18.0,
    ("Bridge_Alpha_Entry", "Bridge_Alpha_Mid"): 12.0,
    ("Bridge_Alpha_Mid", "Bridge_Alpha_Exit"): 13.0,
    ("Bridge_Alpha_Exit", "North_Approach"): 15.0,
    
    # Route B: Via Bridge Beta (Detour Long Route: ~120m total)
    ("Fork_Decision_Point", "Detour_Approach"): 25.0,
    ("Detour_Approach", "Bridge_Beta_Entry"): 15.0,
    ("Bridge_Beta_Entry", "Bridge_Beta_Mid"): 12.0,
    ("Bridge_Beta_Mid", "Bridge_Beta_Exit"): 13.0,
    ("Bridge_Beta_Exit", "North_Approach"): 25.0,
    
    # Final stretch to goal
    ("North_Approach", "North_Goal"): 10.0,
}

def get_path_cost(path, bridge_alpha_closed=False):
    cost = 0.0
    for i in range(len(path) - 1):
        u, v = path[i], path[i+1]
        edge_cost = EDGES.get((u, v), 999.0)
        # If Bridge Alpha is closed, heavily penalize its edges
        if bridge_alpha_closed and ("Bridge_Alpha" in u or "Bridge_Alpha" in v):
            edge_cost = 9999.0
        cost += edge_cost
    return cost

def plan_optimal_route(start="South_Depot", goal="North_Goal", bridge_alpha_closed=False):
    """
    Returns optimal sequence of waypoints based on current bridge status.
    """
    route_alpha = [
        "South_Depot",
        "Fork_Decision_Point",
        "Bridge_Alpha_Entry",
        "Bridge_Alpha_Mid",
        "Bridge_Alpha_Exit",
        "North_Approach",
        "North_Goal"
    ]
    
    route_beta = [
        "South_Depot",
        "Fork_Decision_Point",
        "Detour_Approach",
        "Bridge_Beta_Entry",
        "Bridge_Beta_Mid",
        "Bridge_Beta_Exit",
        "North_Approach",
        "North_Goal"
    ]
    
    cost_a = get_path_cost(route_alpha, bridge_alpha_closed)
    cost_b = get_path_cost(route_beta, bridge_alpha_closed)
    
    if cost_a < cost_b:
        return route_alpha, "VIA_BRIDGE_ALPHA", cost_a
    else:
        return route_beta, "VIA_BRIDGE_BETA", cost_b

if __name__ == "__main__":
    print("Normal Conditions:")
    path, name, cost = plan_optimal_route(bridge_alpha_closed=False)
    print(f"  Optimal Route: {name} (Length: {cost:.1f}m)")
    
    print("\nWhen Bridge Alpha is Closed (Convex Event Triggered):")
    path, name, cost = plan_optimal_route(bridge_alpha_closed=True)
    print(f"  Rerouted Route: {name} (Length: {cost:.1f}m)")
