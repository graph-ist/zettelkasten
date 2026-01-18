/**
 * Tests for quartz/util/graph.ts
 * 
 * Run with: npx tsx quartz/util/graph.test.ts
 */

import { strict as assert } from "assert"
import {
  buildAdjacencyMap,
  buildSlugToFileMap,
  deterministicHash,
  labelPropagation,
  clusteringCoefficient,
  AdjacencyMap,
} from "./graph"
import type { QuartzPluginData } from "../plugins/vfile"

// Mock file data for testing
function createMockFile(slug: string, links: string[] = [], aliases: string[] = []): QuartzPluginData {
  return {
    slug: slug as any,
    frontmatter: aliases.length > 0 ? { aliases } : undefined,
    links: links,  // links is string[]
  } as QuartzPluginData
}

// Test: deterministicHash
function testDeterministicHash() {
  console.log("Testing deterministicHash...")
  
  // Same input should produce same output
  const hash1 = deterministicHash("test")
  const hash2 = deterministicHash("test")
  assert.equal(hash1, hash2, "Same input should produce same hash")
  
  // Different inputs should produce different outputs
  const hash3 = deterministicHash("different")
  assert.notEqual(hash1, hash3, "Different inputs should produce different hashes")
  
  // Should be deterministic across multiple calls
  const results = Array.from({ length: 100 }, () => deterministicHash("consistent"))
  const allSame = results.every(r => r === results[0])
  assert.ok(allSame, "Hash should be consistent across 100 calls")
  
  console.log("✓ deterministicHash tests passed")
}

// Test: buildAdjacencyMap
function testBuildAdjacencyMap() {
  console.log("Testing buildAdjacencyMap...")
  
  const files = [
    createMockFile("a", ["b", "c"]),
    createMockFile("b", ["c"]),
    createMockFile("c", []),
  ]
  
  const adj = buildAdjacencyMap(files)
  
  // Check bidirectional connections
  assert.ok(adj.get("a")?.has("b"), "a should connect to b")
  assert.ok(adj.get("b")?.has("a"), "b should connect back to a")
  assert.ok(adj.get("a")?.has("c"), "a should connect to c")
  assert.ok(adj.get("c")?.has("a"), "c should connect back to a")
  assert.ok(adj.get("b")?.has("c"), "b should connect to c")
  assert.ok(adj.get("c")?.has("b"), "c should connect back to b")
  
  console.log("✓ buildAdjacencyMap tests passed")
}

// Test: buildSlugToFileMap
function testBuildSlugToFileMap() {
  console.log("Testing buildSlugToFileMap...")
  
  const files = [
    createMockFile("kant", [], ["Immanuel Kant", "I. Kant"]),
    createMockFile("hume", [], ["David Hume"]),
  ]
  
  const slugMap = buildSlugToFileMap(files)
  
  // Should find by slug
  assert.ok(slugMap.has("kant"), "Should find by slug")
  
  // Should find by alias (normalized)
  assert.ok(slugMap.has("immanuel-kant"), "Should find by alias")
  assert.ok(slugMap.has("i.-kant"), "Should find by alias with punctuation")
  assert.ok(slugMap.has("david-hume"), "Should find by alias")
  
  // All should point to the correct file
  assert.equal(slugMap.get("kant")?.slug, "kant")
  assert.equal(slugMap.get("immanuel-kant")?.slug, "kant")
  
  console.log("✓ buildSlugToFileMap tests passed")
}

// Test: labelPropagation
function testLabelPropagation() {
  console.log("Testing labelPropagation...")
  
  // Create two disconnected communities for clearer testing
  // Community 1: a-b-c (fully connected, isolated)
  // Community 2: x-y-z (fully connected, isolated)
  const neighbors: AdjacencyMap = new Map([
    ["a", new Set(["b", "c"])],
    ["b", new Set(["a", "c"])],
    ["c", new Set(["a", "b"])],
    ["x", new Set(["y", "z"])],
    ["y", new Set(["x", "z"])],
    ["z", new Set(["x", "y"])],
  ])
  
  const labels = labelPropagation(neighbors, 20)
  
  // a, b, c should have the same label (connected component)
  assert.equal(labels.get("a"), labels.get("b"), "a and b should be in same community")
  assert.equal(labels.get("b"), labels.get("c"), "b and c should be in same community")
  
  // x, y, z should have the same label (connected component)
  assert.equal(labels.get("x"), labels.get("y"), "x and y should be in same community")
  assert.equal(labels.get("y"), labels.get("z"), "y and z should be in same community")
  
  // Disconnected components should have different labels
  assert.notEqual(labels.get("a"), labels.get("x"), "Disconnected communities should be different")
  
  // Should be deterministic
  const labels2 = labelPropagation(neighbors, 20)
  for (const node of neighbors.keys()) {
    assert.equal(labels.get(node), labels2.get(node), `Label for ${node} should be deterministic`)
  }
  
  console.log("✓ labelPropagation tests passed")
}

// Test: clusteringCoefficient
function testClusteringCoefficient() {
  console.log("Testing clusteringCoefficient...")
  
  // Triangle: all neighbors connected = CC of 1
  const triangle: AdjacencyMap = new Map([
    ["a", new Set(["b", "c"])],
    ["b", new Set(["a", "c"])],
    ["c", new Set(["a", "b"])],
  ])
  
  const ccTriangle = clusteringCoefficient("a", triangle)
  assert.equal(ccTriangle, 1, "Triangle should have CC of 1")
  
  // Star: center has neighbors that aren't connected = CC of 0
  const star: AdjacencyMap = new Map([
    ["center", new Set(["a", "b", "c"])],
    ["a", new Set(["center"])],
    ["b", new Set(["center"])],
    ["c", new Set(["center"])],
  ])
  
  const ccStar = clusteringCoefficient("center", star)
  assert.equal(ccStar, 0, "Star center should have CC of 0")
  
  // Node with only one neighbor = CC of 0
  const ccLeaf = clusteringCoefficient("a", star)
  assert.equal(ccLeaf, 0, "Leaf node should have CC of 0")
  
  // Node with no neighbors
  const isolated: AdjacencyMap = new Map([["alone", new Set()]])
  const ccIsolated = clusteringCoefficient("alone", isolated)
  assert.equal(ccIsolated, 0, "Isolated node should have CC of 0")
  
  console.log("✓ clusteringCoefficient tests passed")
}

// Run all tests
function runTests() {
  console.log("\n=== Running graph.ts tests ===\n")
  
  try {
    testDeterministicHash()
    testBuildAdjacencyMap()
    testBuildSlugToFileMap()
    testLabelPropagation()
    testClusteringCoefficient()
    
    console.log("\n✅ All tests passed!\n")
  } catch (error) {
    console.error("\n❌ Test failed:", error)
    process.exit(1)
  }
}

runTests()
